import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
// CRUD admin générique, limité à une liste blanche de tables et de champs.
type K = "s" | "n" | "n?" | "d?" | "b";
const T: Record<string, Record<string, K>> = {
  services: { network: "s", category: "s", name: "s", description: "s", price_per_1000: "n", min_qty: "n", max_qty: "n", eta: "s", link_hint: "s", sort_order: "n", is_active: "b" },
  promo_codes: { code: "s", percent_off: "n?", amount_off: "n?", max_uses: "n?", expires_at: "d?", is_active: "b" },
  testimonials: { author: "s", content: "s", is_published: "b" },
  site_settings: { value: "s" },
};
function clean(spec: Record<string, K>, v: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, t] of Object.entries(spec)) {
    if (!(k in v)) continue; const x = v[k];
    if (t === "s") out[k] = String(x ?? "").slice(0, 1000);
    else if (t === "b") out[k] = Boolean(x);
    else if (t === "n" || t === "n?") {
      if (t === "n?" && (x === "" || x == null)) { out[k] = null; continue; }
      const n = Number(x); if (!Number.isInteger(n) || n < 0) throw new Error(`Valeur invalide : ${k}`); out[k] = n;
    } else { if (!x) { out[k] = null; continue; } const d = new Date(String(x)); if (isNaN(+d)) throw new Error(`Date invalide : ${k}`); out[k] = d.toISOString(); }
  }
  if (typeof out.code === "string") out.code = out.code.toUpperCase().trim();
  return out;
}
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const b = await req.json().catch(() => null);
  const spec = b && T[b.table]; if (!spec) return NextResponse.json({ error: "Table non autorisée" }, { status: 400 });
  const idCol = b.table === "site_settings" ? "key" : "id"; const db = supabaseAdmin();
  try {
    if (b.op === "insert") {
      if (b.table === "site_settings") return NextResponse.json({ error: "Non autorisé" }, { status: 400 });
      const extra = b.table === "promo_codes" ? { code: "s" as K } : {};
      const { error } = await db.from(b.table).insert(clean({ ...spec, ...extra }, b.values ?? {})); if (error) throw new Error(error.message);
    } else if (b.op === "update") {
      const { error } = await db.from(b.table).update(clean(b.table === "promo_codes" ? { ...spec, code: "s" } : spec, b.values ?? {})).eq(idCol, b.id); if (error) throw new Error(error.message);
    } else if (b.op === "delete") {
      if (b.table === "site_settings") return NextResponse.json({ error: "Non autorisé" }, { status: 400 });
      const { error } = await db.from(b.table).delete().eq("id", b.id);
      if (error) throw new Error(b.table === "services" ? "Des commandes existent : désactive ce service au lieu de le supprimer." : error.message);
    } else return NextResponse.json({ error: "Opération inconnue" }, { status: 400 });
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }
  await db.from("admin_logs").insert({ admin_id: admin.id, action: `${b.table}_${b.op}`, details: { id: b.id ?? null } });
  return NextResponse.json({ ok: true });
}
