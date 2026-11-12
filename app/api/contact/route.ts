import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (b?.website) return NextResponse.json({ ok: true }); // champ piège anti-spam
  const name = String(b?.name ?? "").trim().slice(0, 100), message = String(b?.message ?? "").trim().slice(0, 2000);
  if (!name || message.length < 5) return NextResponse.json({ error: "Nom et message requis" }, { status: 400 });
  const { error } = await supabaseAdmin().from("contact_messages").insert({ name, email: String(b.email ?? "").slice(0, 150) || null, phone: String(b.phone ?? "").slice(0, 30) || null, message });
  return error ? NextResponse.json({ error: "Envoi impossible" }, { status: 500 }) : NextResponse.json({ ok: true });
}
