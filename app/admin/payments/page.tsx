import { PaymentButtons } from "@/components/AdminActions";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fcfa } from "@/lib/pricing";
const st: Record<string, string> = { pending: "En attente", paid: "Payé", rejected: "Refusé" };
export default async function AdminPayments() {
  const { data } = await supabaseAdmin().from("payments").select("id,method,amount,reference,payer_phone,status,created_at,orders(public_id),profiles!payments_user_id_fkey(full_name)").order("created_at", { ascending: false }).limit(200);
  const rows = [...(data ?? [])].sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending"));
  return (<><h1 className="mb-4 text-2xl font-extrabold">Paiements</h1>
    {rows.length ? <div className="grid gap-3">{rows.map(p => (
      <div key={p.id} className="card"><div className="flex flex-wrap justify-between gap-2"><b>{(p.orders as unknown as { public_id: string } | null)?.public_id ?? "—"} · {fcfa(p.amount)}</b><span className={p.status === "paid" ? "text-emerald-300" : p.status === "rejected" ? "text-red-300" : "text-neon"}>{st[p.status]}</span></div>
        <p className="text-white/70">{(p.profiles as unknown as { full_name: string } | null)?.full_name} · {p.method} · réf. {p.reference ?? "—"} · {p.payer_phone ?? ""}</p>
        <p className="text-xs text-white/50">Vérifie la réception réelle de l’argent avant de confirmer.</p>
        {p.status === "pending" && <PaymentButtons id={p.id} />}</div>))}</div> : <p className="text-white/60">Aucun paiement.</p>}</>);
}
