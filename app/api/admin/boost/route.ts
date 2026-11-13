import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
// L’admin se booste lui-même : commande gratuite, tracée dans le journal.
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const b = await req.json().catch(() => null);
  const quantity = Number(b?.quantity);
  let url: URL; try { url = new URL(String(b?.link)); } catch { return NextResponse.json({ error: "Lien invalide" }, { status: 400 }); }
  if (url.protocol !== "https:" || !Number.isInteger(quantity) || quantity < 1) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const db = supabaseAdmin();
  const { data: s } = await db.from("services").select("id,max_qty").eq("id", b.serviceId).maybeSingle();
  if (!s || quantity > s.max_qty) return NextResponse.json({ error: "Service ou quantité invalide" }, { status: 400 });
  const { data: o, error } = await db.from("orders").insert({
    user_id: admin.id, service_id: s.id, link: String(b.link), quantity, unit_price_per_1000: 0, total: 0,
    is_free: true, status: "accepted", admin_note: "Boost administrateur",
  }).select("public_id").single();
  if (error) return NextResponse.json({ error: "Échec de création" }, { status: 500 });
  await db.from("admin_logs").insert({ admin_id: admin.id, action: "self_boost", target_user: admin.id, details: { order: o.public_id, quantity } });
  return NextResponse.json({ publicId: o.public_id });
}
