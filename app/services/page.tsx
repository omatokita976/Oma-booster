import ServiceCatalog from "@/components/ServiceCatalog";
import { getSupabase } from "@/lib/supabase/server";
export const metadata = { title: "Services — OMA-BOOSTER" };
export default async function Services({ searchParams }: { searchParams: Promise<{ network?: string }> }) {
  const { network } = await searchParams;
  const sb = await getSupabase();
  const { data } = await sb.from("services").select("id,name,network,category,price_per_1000,min_qty,max_qty,eta").eq("is_active", true).order("sort_order");
  return <main className="mx-auto max-w-6xl px-4 py-10"><h1 className="mb-6 text-3xl font-extrabold">Nos services</h1><ServiceCatalog services={data ?? []} initial={network} /></main>;
}
