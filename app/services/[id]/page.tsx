import { notFound } from "next/navigation";
import OrderForm from "@/components/OrderForm";
import { getSupabase } from "@/lib/supabase/server";
import { NETWORKS, fcfa } from "@/lib/pricing";
export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await getSupabase();
  const { data: s } = await sb.from("services").select("*").eq("id", id).eq("is_active", true).maybeSingle();
  if (!s) notFound();
  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-2">
      <div><p className="text-neon">{NETWORKS[s.network]} · {s.category}</p><h1 className="mt-1 text-3xl font-extrabold">{s.name}</h1>
        <p className="mt-4 text-white/70">{s.description}</p>
        <ul className="mt-5 grid gap-1 text-white/80"><li>Prix : {fcfa(s.price_per_1000)} pour 1 000</li><li>Minimum : {s.min_qty} · Maximum : {s.max_qty}</li><li>Délai estimé : {s.eta ?? "communiqué après commande"}</li></ul></div>
      <OrderForm s={s} />
    </main>);
}
