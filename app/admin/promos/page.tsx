import CrudManager, { type F } from "@/components/CrudManager";
import { supabaseAdmin } from "@/lib/supabase/admin";
const fields: F[] = [{ key: "code", label: "Code", type: "text" }, { key: "percent_off", label: "Réduction %", type: "number" }, { key: "amount_off", label: "Réduction FCFA", type: "number" },
  { key: "max_uses", label: "Utilisations max", type: "number" }, { key: "expires_at", label: "Expire le", type: "date" }, { key: "is_active", label: "Actif", type: "checkbox" }];
export default async function P() {
  const { data } = await supabaseAdmin().from("promo_codes").select("*").order("code");
  return (<><h1 className="mb-1 text-2xl font-extrabold">Codes promo</h1><p className="mb-4 text-sm text-white/60">Renseigne soit un pourcentage, soit un montant en FCFA.</p>
    <CrudManager table="promo_codes" fields={fields} rows={data ?? []} blank={{ code: "", percent_off: "", amount_off: "", max_uses: "", expires_at: "", is_active: true }} /></>);
}
