import OrderWizard from "@/components/OrderWizard";
import { getSupabase } from "@/lib/supabase/server";
export const metadata = { title: "Commander — OMA-BOOSTER" };
export default async function Commander() {
  const sb = await getSupabase(); const { data: { user } } = await sb.auth.getUser();
  const [{ data: services }, { data: me }] = await Promise.all([
    sb.from("services").select("id,network,name,group_title,option_label,price_per_1000,min_qty,max_qty,eta,link_hint").eq("is_active", true).order("sort_order"),
    sb.from("profiles").select("balance").eq("id", user!.id).single(),
  ]);
  return <OrderWizard services={services ?? []} balance={me?.balance ?? 0} />;
}
