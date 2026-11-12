import BoostForm from "@/components/BoostForm";
import { supabaseAdmin } from "@/lib/supabase/admin";
export default async function Boost() {
  const { data } = await supabaseAdmin().from("services").select("id,name,network,max_qty").order("sort_order");
  return (<><h1 className="mb-4 text-2xl font-extrabold">Me booster moi-même</h1>
    {data?.length ? <BoostForm services={data} /> : <p className="text-white/60">Ajoute d’abord des services (seed.sql).</p>}</>);
}
