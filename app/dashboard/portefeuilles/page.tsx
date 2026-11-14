import TopupForm from "@/components/TopupForm";
import { getSupabase } from "@/lib/supabase/server";
import { fcfa } from "@/lib/pricing";
const st: Record<string, string> = { pending: "En attente", paid: "Payé", rejected: "Refusé" };
export default async function Wallet() {
  const sb = await getSupabase(); const { data: { user } } = await sb.auth.getUser();
  const [{ data: me }, { data: cfg }, { data: tops }, { data: led }] = await Promise.all([
    sb.from("profiles").select("balance").eq("id", user!.id).single(),
    sb.from("site_settings").select("key,value").in("key", ["mtn_momo_number", "orange_money_number"]),
    sb.from("payments").select("id,amount,method,status,created_at").eq("user_id", user!.id).is("order_id", null).order("created_at", { ascending: false }).limit(10),
    sb.from("balance_ledger").select("id,delta,reason,created_at").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(15),
  ]);
  const num = (k: string) => cfg?.find(c => c.key === k)?.value ?? "";
  return (
    <main className="mx-auto max-w-xl px-4 pt-6">
      <div className="card mb-5"><p className="text-white/60">Solde disponible</p><p className="text-4xl font-extrabold">{fcfa(me?.balance ?? 0)}</p></div>
      <TopupForm mtn={num("mtn_momo_number")} orange={num("orange_money_number")} />
      <h2 className="mb-3 mt-8 text-xl font-bold">Mes recharges</h2>
      <div className="grid gap-2">{tops?.length ? tops.map(t => <div key={t.id} className="card flex justify-between !p-3"><span>{fcfa(t.amount)} · {t.method} · {new Date(t.created_at).toLocaleDateString("fr-FR")}</span><b>{st[t.status]}</b></div>) : <p className="text-white/60">Aucune recharge.</p>}</div>
      <h2 className="mb-3 mt-8 text-xl font-bold">Mouvements du solde</h2>
      <div className="grid gap-2">{led?.length ? led.map(l => <div key={l.id} className="card flex justify-between !p-3"><span>{l.reason}<br /><span className="text-xs text-white/50">{new Date(l.created_at).toLocaleString("fr-FR")}</span></span><b className={l.delta > 0 ? "text-emerald-300" : "text-red-300"}>{l.delta > 0 ? "+" : ""}{fcfa(l.delta)}</b></div>) : <p className="text-white/60">Aucun mouvement.</p>}</div>
    </main>);
}
