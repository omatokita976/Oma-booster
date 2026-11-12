import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase/server";
import PayForm from "@/components/PayForm";
import { fcfa } from "@/lib/pricing";
const label: Record<string, string> = { pending: "En attente", accepted: "Acceptée", processing: "En cours", completed: "Terminée", cancelled: "Annulée", refused: "Refusée" };
export default async function Orders({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const { new: created } = await searchParams;
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/connexion");
  const [{ data: me }, { data: orders }, { data: pays }, { data: cfg }] = await Promise.all([
    sb.from("profiles").select("full_name,balance,role,banned_until,banned_permanent,ban_reason").eq("id", user.id).single(),
    sb.from("orders").select("id,public_id,link,quantity,total,status,created_at,is_free,services(name)").eq("user_id", user.id).order("created_at", { ascending: false }),
    sb.from("payments").select("order_id,status").eq("user_id", user.id),
    sb.from("site_settings").select("key,value").in("key", ["mtn_momo_number", "orange_money_number"]),
  ]);
  const num = (k: string) => cfg?.find(c => c.key === k)?.value ?? "";
  const banned = me?.banned_permanent || (me?.banned_until && new Date(me.banned_until) > new Date());
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3"><h1 className="text-3xl font-extrabold">Bonjour {me?.full_name ?? ""}</h1>
        <div className="card !py-3">Solde : <b>{fcfa(me?.balance ?? 0)}</b></div></div>
      {banned && <p className="mt-4 rounded-xl border border-red-500/50 p-3 text-red-300">Ton compte est suspendu {me?.banned_permanent ? "définitivement" : `jusqu’au ${new Date(me!.banned_until!).toLocaleDateString("fr-FR")}`}{me?.ban_reason ? ` — ${me.ban_reason}` : ""}. Contacte le support.</p>}
      {created && <p className="mt-4 rounded-xl border border-neon/50 p-3">Commande {created} enregistrée. Elle démarre après vérification du paiement.</p>}
      <a href="/dashboard/paiements" className="btn-ghost mr-2 mt-4">Mes paiements</a><a href="/dashboard/support" className="btn-ghost mr-2 mt-4">Support</a><a href="/dashboard/profil" className="btn-ghost mr-2 mt-4">Profil</a>
      {me?.role === "admin" && <a href="/admin/users" className="btn-ghost mt-4">Espace administrateur</a>}
      <h2 className="mb-3 mt-8 text-xl font-bold">Mes commandes</h2>
      {orders?.length ? <div className="grid gap-3">{orders.map(o => (
        <div key={o.public_id} className="card"><div className="flex justify-between"><b>{o.public_id}</b><span className="text-neon">{label[o.status]}</span></div>
          <p>{(o.services as unknown as { name: string } | null)?.name} · {o.quantity}</p><p className="break-all text-sm text-white/50">{o.link}</p>
          <p className="mt-1">{o.is_free ? "Offert" : fcfa(o.total)}</p>
          {o.status === "pending" && !o.is_free && (() => { const pp = pays?.find(x => x.order_id === o.id && x.status !== "rejected"); return pp ? <p className="mt-2 text-sm text-neon">Paiement {pp.status === "paid" ? "confirmé" : "en cours de vérification"}.</p> : <PayForm orderId={o.id} mtn={num("mtn_momo_number")} orange={num("orange_money_number")} />; })()}</div>))}</div> : <p className="text-white/60">Aucune commande pour l’instant.</p>}
    </main>);
}
