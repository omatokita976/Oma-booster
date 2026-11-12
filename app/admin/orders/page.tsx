import { OrderStatus } from "@/components/AdminActions";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fcfa } from "@/lib/pricing";
export default async function AdminOrders() {
  const { data } = await supabaseAdmin().from("orders").select("id,public_id,link,quantity,total,status,is_free,created_at,services(name),profiles(full_name)").order("created_at", { ascending: false }).limit(200);
  return (<><h1 className="mb-4 text-2xl font-extrabold">Commandes</h1>
    {data?.length ? <div className="grid gap-3">{data.map(o => (
      <div key={o.id} className="card"><div className="flex flex-wrap justify-between gap-2"><b>{o.public_id}</b><span className="text-white/60">{new Date(o.created_at).toLocaleString("fr-FR")}</span></div>
        <p>{(o.profiles as unknown as { full_name: string } | null)?.full_name} · {(o.services as unknown as { name: string } | null)?.name} · {o.quantity} · {o.is_free ? "Offert" : fcfa(o.total)}</p>
        <a className="break-all text-sm text-neon" href={o.link} target="_blank" rel="noopener noreferrer">{o.link}</a>
        <OrderStatus id={o.id} status={o.status} /></div>))}</div> : <p className="text-white/60">Aucune commande.</p>}</>);
}
