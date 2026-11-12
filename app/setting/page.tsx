import CrudManager, { type F } from "@/components/CrudManager";
import { supabaseAdmin } from "@/lib/supabase/admin";
const fields: F[] = [{ key: "key", label: "Réglage", type: "text", readOnly: true }, { key: "value", label: "Valeur", type: "text" }];
export default async function P() {
  const { data } = await supabaseAdmin().from("site_settings").select("*").order("key");
  return (<><h1 className="mb-1 text-2xl font-extrabold">Réglages du site</h1><p className="mb-4 text-sm text-white/60">Renseigne whatsapp_number (ex. 2376XXXXXXXX), mtn_momo_number et orange_money_number.</p>
    <CrudManager table="site_settings" idKey="key" fields={fields} rows={data ?? []} canDelete={false} /></>);
}
