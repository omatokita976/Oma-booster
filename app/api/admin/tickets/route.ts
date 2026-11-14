import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function POST(req: Request) {
  const admin = await getAdmin(); if (!admin) return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const b = await req.json().catch(() => null); const body = String(b?.body ?? "").trim(); const db = supabaseAdmin();
  if (!b?.ticketId) return NextResponse.json({ error: "Ticket manquant" }, { status: 400 });
  if (body) await db.from("ticket_messages").insert({ ticket_id: b.ticketId, author_id: admin.id, is_admin: true, body: body.slice(0, 2000) });
  await db.from("tickets").update({ status: b.close ? "closed" : "answered" }).eq("id", b.ticketId);
  return NextResponse.json({ ok: true });
}
