import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { computeTotal } from "@/lib/pricing";
export async function POST(req: Request) {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const quantity = Number(b?.quantity);
  if (!b || typeof b.serviceId !== "string" || !Number.isInteger(quantity)) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  let url: URL; try { url = new URL(String(b.link)); } catch { return NextResponse.json({ error: "Lien invalide" }, { status: 400 }); }
  if (url.protocol !== "https:" || String(b.link).length > 500) return NextResponse.json({ error: "Lien invalide" }, { status: 400 });
  const db = supabaseAdmin();
  const { data: me } = await db.from("profiles").select("banned_until,banned_permanent").eq("id", user.id).single();
  if (me?.banned_permanent || (me?.banned_until && new Date(me.banned_until) > new Date())) return NextResponse.json({ error: "Compte suspendu : commande impossible" }, { status: 403 });
  const { data: s } = await db.from("services").select("*").eq("id", b.serviceId).eq("is_active", true).maybeSingle();
  if (!s) return NextResponse.json({ error: "Service introuvable" }, { status: 404 });
  if (quantity < s.min_qty || quantity > s.max_qty) return NextResponse.json({ error: `Quantité entre ${s.min_qty} et ${s.max_qty}` }, { status: 400 });
  let discount = 0, promoId: string | null = null;
  const subtotal = computeTotal(quantity, s.price_per_1000);
  if (b.promoCode) {
    const { data: p } = await db.from("promo_codes").select("*").eq("code", String(b.promoCode).toUpperCase()).eq("is_active", true).maybeSingle();
    const valid = p && (!p.expires_at || new Date(p.expires_at) > new Date()) && (p.max_uses == null || p.used_count < p.max_uses);
    if (!valid) return NextResponse.json({ error: "Code promo invalide ou expiré" }, { status: 400 });
    discount = Math.min(subtotal, p.percent_off ? Math.floor((subtotal * p.percent_off) / 100) : p.amount_off ?? 0);
    promoId = p.id;
  }
  const { data: order, error } = await db.from("orders").insert({
    user_id: user.id, service_id: s.id, link: String(b.link), quantity, unit_price_per_1000: s.price_per_1000,
    discount, total: subtotal - discount, promo_code_id: promoId,
  }).select("id,public_id,total").single();
  if (error) return NextResponse.json({ error: "Impossible de créer la commande" }, { status: 500 });
  if (b.useBalance) {
    const { error: e2 } = await db.rpc("adjust_balance", { uid: user.id, delta: -order.total, reason: `Commande ${order.public_id}`, actor: user.id });
    if (e2) { await db.from("orders").delete().eq("public_id", order.public_id); return NextResponse.json({ error: "Solde insuffisant" }, { status: 400 }); }
    await db.from("payments").insert({ user_id: user.id, order_id: order.id, method: "balance", amount: Math.max(order.total, 1), status: "paid", confirmed_at: new Date().toISOString() });
    await db.from("orders").update({ status: "accepted" }).eq("id", order.id);
  }
  if (promoId) await db.rpc("increment_promo_use", { pid: promoId });
  return NextResponse.json({ publicId: order.public_id, total: order.total });
}
