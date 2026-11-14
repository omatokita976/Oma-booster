import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
// Le client DÉCLARE un paiement (référence de transaction). Rien n’est « payé » avant confirmation admin.
export async function POST(req: Request) {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const reference = String(b?.reference ?? "").trim();
  if (!b || !["mtn_momo", "orange_money", "manual_transfer"].includes(b.method) || reference.length < 4 || reference.length > 60)
    return NextResponse.json({ error: "Méthode ou référence de transaction invalide" }, { status: 400 });
  const db = supabaseAdmin();
  if (b.topup) { // recharge du solde : créditée seulement après confirmation admin
    const amount = Number(b.amount);
    if (!Number.isInteger(amount) || amount < 100 || amount > 1_000_000) return NextResponse.json({ error: "Montant entre 100 et 1 000 000 FCFA" }, { status: 400 });
    const { count: open } = await db.from("payments").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("order_id", null).eq("status", "pending");
    if ((open ?? 0) >= 3) return NextResponse.json({ error: "Tu as déjà 3 recharges en attente de vérification" }, { status: 400 });
    const { error: e } = await db.from("payments").insert({ user_id: user.id, method: b.method, amount, reference, payer_phone: String(b.payerPhone ?? "").slice(0, 20) || null });
    return e ? NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 }) : NextResponse.json({ ok: true });
  }
  const { data: o } = await db.from("orders").select("id,total,status,is_free").eq("id", b.orderId).eq("user_id", user.id).maybeSingle();
  if (!o || o.status !== "pending" || o.is_free) return NextResponse.json({ error: "Commande non payable" }, { status: 400 });
  const { count } = await db.from("payments").select("id", { count: "exact", head: true }).eq("order_id", o.id).in("status", ["pending", "paid"]);
  if (count) return NextResponse.json({ error: "Un paiement est déjà enregistré pour cette commande" }, { status: 400 });
  const { error } = await db.from("payments").insert({
    order_id: o.id, user_id: user.id, method: b.method, amount: Math.max(o.total, 1), reference,
    payer_phone: String(b.payerPhone ?? "").slice(0, 20) || null,
  });
  if (error) return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
