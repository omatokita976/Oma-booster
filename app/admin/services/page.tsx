import CrudManager, { type F } from "@/components/CrudManager";
import { supabaseAdmin } from "@/lib/supabase/admin";
const fields: F[] = [
  { key: "network", label: "Réseau", type: "select", options: ["facebook", "instagram", "tiktok", "youtube", "x", "threads", "telegram", "whatsapp"] },
  { key: "category", label: "Catégorie", type: "text" }, { key: "name", label: "Nom", type: "text" }, { key: "description", label: "Description", type: "textarea" },
  { key: "price_per_1000", label: "Prix pour 1 000 (FCFA)", type: "number" }, { key: "min_qty", label: "Quantité min", type: "number" }, { key: "max_qty", label: "Quantité max", type: "number" },
  { key: "eta", label: "Délai estimé", type: "text" }, { key: "link_hint", label: "Aide pour le lien", type: "text" }, { key: "sort_order", label: "Ordre", type: "number" }, { key: "is_active", label: "Actif", type: "checkbox" },
];
export default async function P() {
  const { data } = await supabaseAdmin().from("services").select("*").order("sort_order");
  return (<><h1 className="mb-4 text-2xl font-extrabold">Services</h1>
    <CrudManager table="services" fields={fields} rows={data ?? []} blank={{ network: "facebook", category: "Promotion", name: "", description: "", price_per_1000: 1500, min_qty: 1000, max_qty: 100000, eta: "", link_hint: "", sort_order: 0, is_active: true }} /></>);
}
