import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const b = await req.json().catch(() => null);
  if (!b || !["confirm", "reject"].includes(b.action)) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const db = supabaseAdmin();
  const { data: p } = await db.from("payments").select("id,order_id,user_id,amount,status").eq("id", b.paymentId).maybeSingle();
  if (!p || p.status !== "pending") return NextResponse.json({ error: "Paiement introuvable ou déjà traité" }, { status: 400 });
  const paid = b.action === "confirm";
  // Le changement d’état est conditionné à « pending » : impossible de confirmer (donc de créditer) deux fois.
  const { data: upd } = await db.from("payments").update({ status: paid ? "paid" : "rejected", confirmed_by: admin.id, confirmed_at: new Date().toISOString() }).eq("id", p.id).eq("status", "pending").select("id");
  if (!upd?.length) return NextResponse.json({ error: "Paiement déjà traité" }, { status: 400 });
  if (paid && p.order_id) await db.from("orders").update({ status: "accepted", updated_at: new Date().toISOString() }).eq("id", p.order_id).eq("status", "pending");
  if (paid && !p.order_id) await db.rpc("adjust_balance", { uid: p.user_id, delta: p.amount, reason: "Recharge confirmée", actor: admin.id });
  await db.from("admin_logs").insert({ admin_id: admin.id, action: paid ? "payment_confirm" : "payment_reject", target_user: p.user_id, details: { payment: p.id, amount: p.amount, topup: !p.order_id } });
  return NextResponse.json({ ok: true });
}
