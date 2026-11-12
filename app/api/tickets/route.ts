import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function POST(req: Request) {
  const sb = await getSupabase(); const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  const b = await req.json().catch(() => null); const body = String(b?.body ?? "").trim();
  if (!body || body.length > 2000) return NextResponse.json({ error: "Message vide ou trop long" }, { status: 400 });
  const db = supabaseAdmin(); let ticketId = b?.ticketId as string | undefined;
  if (ticketId) {
    const { data: t } = await db.from("tickets").select("id").eq("id", ticketId).eq("user_id", user.id).maybeSingle();
    if (!t) return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
    await db.from("tickets").update({ status: "open" }).eq("id", ticketId);
  } else {
    const subject = String(b?.subject ?? "").trim().slice(0, 120); if (!subject) return NextResponse.json({ error: "Sujet requis" }, { status: 400 });
    const { data: t, error } = await db.from("tickets").insert({ user_id: user.id, subject }).select("id").single();
    if (error) return NextResponse.json({ error: "Création impossible" }, { status: 500 }); ticketId = t.id;
  }
  await db.from("ticket_messages").insert({ ticket_id: ticketId, author_id: user.id, is_admin: false, body });
  return NextResponse.json({ ok: true });
}
