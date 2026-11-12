import { supabaseAdmin } from "@/lib/supabase/admin";
import { fcfa } from "@/lib/pricing";
export default async function AdminHome() {
  const db = supabaseAdmin();
  const [{ data: paid }, { count: users }, { count: orders }, { count: pendingPay }, { count: pendingOrd }] = await Promise.all([
    db.from("payments").select("amount").eq("status", "paid").neq("method", "balance"),
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("orders").select("id", { count: "exact", head: true }),
    db.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  const revenue = (paid ?? []).reduce((s, p) => s + p.amount, 0);
  const cards: [string, string][] = [["Chiffre d’affaires (paiements confirmés)", fcfa(revenue)], ["Utilisateurs", String(users ?? 0)], ["Commandes", String(orders ?? 0)], ["Commandes en attente", String(pendingOrd ?? 0)], ["Paiements à vérifier", String(pendingPay ?? 0)]];
  return (<><h1 className="mb-4 text-2xl font-extrabold">Tableau de bord admin</h1><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([t, v]) => <div key={t} className="card"><p className="text-sm text-white/60">{t}</p><p className="mt-1 text-2xl font-extrabold">{v}</p></div>)}</div></>);
}
