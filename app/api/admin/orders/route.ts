import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
const STATUSES = ["pending", "accepted", "processing", "completed", "cancelled", "refused"];
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const b = await req.json().catch(() => null);
  if (!b || !STATUSES.includes(b.status)) return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  const db = supabaseAdmin();
  const { data: o } = await db.from("orders").select("id,public_id,user_id,total,status,is_free").eq("id", b.orderId).maybeSingle();
  if (!o) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  const closed = ["cancelled", "refused"];
  // Remboursement automatique, une seule fois, si la commande avait été payée avec le solde
  if (closed.includes(b.status) && !closed.includes(o.status) && !o.is_free && o.total > 0) {
    const { data: pay } = await db.from("payments").select("id").eq("order_id", o.id).eq("method", "balance").eq("status", "paid").maybeSingle();
    if (pay) await db.rpc("adjust_balance", { uid: o.user_id, delta: o.total, reason: `Remboursement ${o.public_id}`, actor: admin.id });
  }
  await db.from("orders").update({ status: b.status, admin_note: b.note ? String(b.note).slice(0, 300) : null, updated_at: new Date().toISOString() }).eq("id", o.id);
  await db.from("admin_logs").insert({ admin_id: admin.id, action: "order_status", target_user: o.user_id, details: { order: o.public_id, from: o.status, to: b.status } });
  return NextResponse.json({ ok: true });
}
