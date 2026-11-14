import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
const hits = new Map<string, { n: number; t: number }>(); // limiteur par instance (défense en plus du pare-feu Vercel)
function limited(key: string, max: number) {
  const now = Date.now(), h = hits.get(key);
  if (!h || now - h.t > 60_000) { hits.set(key, { n: 1, t: now }); return false; }
  if (hits.size > 5000) hits.clear();
  return ++h.n > max;
}
const notFound = () => new NextResponse("Not found", { status: 404 });
export async function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname, ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "?";
  const isApi = p.startsWith("/api/"), isAdminArea = p.startsWith("/admin") || p.startsWith("/api/admin") || p === "/acces-admin";
  if (isApi) {
    // Anti-CSRF : toute écriture doit venir de notre propre site
    if (req.method !== "GET" && req.method !== "HEAD") {
      const o = req.headers.get("origin"); if (!o || new URL(o).host !== req.nextUrl.host) return new NextResponse("Forbidden", { status: 403 });
    }
    if (limited(`${ip}:${isAdminArea ? "a" : "p"}`, isAdminArea ? 30 : 100)) return new NextResponse("Too many requests", { status: 429 });
  }
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options?: any }[]) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await sb.auth.getUser();
  if (isAdminArea) {
    // Pour tout le monde sauf l’admin vérifié, la zone admin N’EXISTE PAS (404, aucune redirection qui la révèle).
    const allowed = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
    if (!user?.email || !allowed.includes(user.email.toLowerCase())) return notFound();
    const { data: me } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (me?.role !== "admin") return notFound();
    if (p !== "/acces-admin") {
      const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel !== "aal2") return isApi ? notFound() : NextResponse.redirect(new URL("/acces-admin", req.url));
    }
  } else if (!user && p.startsWith("/dashboard")) {
    const u = req.nextUrl.clone(); u.pathname = "/connexion"; u.search = `?next=${p}`; return NextResponse.redirect(u);
  }
  return res;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
