import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Interdit" }, { status: 403 });
  const b = await req.json().catch(() => null);
  if (!b || typeof b.userId !== "string") return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const db = supabaseAdmin();
  const { data: target } = await db.from("profiles").select("id,role").eq("id", b.userId).maybeSingle();
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  const log = (action: string, details: object) => db.from("admin_logs").insert({ admin_id: admin.id, action, target_user: b.userId, details });

  if (b.action === "credit") {
    const amount = Number(b.amount);
    if (!Number.isInteger(amount) || amount === 0 || Math.abs(amount) > 10_000_000) return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    const reason = String(b.reason || "Ajustement admin").slice(0, 200);
    const { data, error } = await db.rpc("adjust_balance", { uid: b.userId, delta: amount, reason, actor: admin.id });
    if (error) return NextResponse.json({ error: "Solde insuffisant pour ce retrait" }, { status: 400 });
    await log("credit", { amount, reason }); return NextResponse.json({ balance: data });
  }
  if (b.action === "ban") {
    if (target.role === "admin") return NextResponse.json({ error: "Impossible de bannir un admin" }, { status: 400 });
    const reason = String(b.reason || "").slice(0, 200);
    if (b.permanent) {
      await db.from("profiles").update({ banned_permanent: true, banned_until: null, ban_reason: reason }).eq("id", b.userId);
      await log("ban", { permanent: true, reason }); return NextResponse.json({ ok: true });
    }
    const days = Number(b.days);
    if (!Number.isInteger(days) || days < 1 || days > 3650) return NextResponse.json({ error: "Nombre de jours invalide (1–3650)" }, { status: 400 });
    const until = new Date(Date.now() + days * 864e5).toISOString();
    await db.from("profiles").update({ banned_permanent: false, banned_until: until, ban_reason: reason }).eq("id", b.userId);
    await log("ban", { days, until, reason }); return NextResponse.json({ ok: true });
  }
  if (b.action === "unban") {
    await db.from("profiles").update({ banned_permanent: false, banned_until: null, ban_reason: null }).eq("id", b.userId);
    await log("unban", {}); return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
