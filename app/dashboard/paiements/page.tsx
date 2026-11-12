import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase/server";
import { fcfa } from "@/lib/pricing";
const st: Record<string, string> = { pending: "En attente", paid: "Payé", rejected: "Refusé" };
export default async function Pay() {
  const sb = await getSupabase(); const { data: { user } } = await sb.auth.getUser(); if (!user) redirect("/connexion");
  const { data } = await sb.from("payments").select("id,method,amount,reference,status,created_at,orders(public_id)").eq("user_id", user.id).order("created_at", { ascending: false });
  return (<main className="mx-auto max-w-5xl px-4 py-10"><h1 className="mb-4 text-3xl font-extrabold">Mes paiements</h1>
    {data?.length ? <div className="grid gap-3">{data.map(p => <div key={p.id} className="card flex flex-wrap justify-between gap-2"><span>{(p.orders as unknown as { public_id: string } | null)?.public_id} · {p.method} · {fcfa(p.amount)} · {new Date(p.created_at).toLocaleDateString("fr-FR")}</span><b>{st[p.status]}</b></div>)}</div> : <p className="text-white/60">Aucun paiement pour l’instant.</p>}</main>);
}
