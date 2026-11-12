import CrudManager, { type F } from "@/components/CrudManager";
import { supabaseAdmin } from "@/lib/supabase/admin";
const fields: F[] = [{ key: "author", label: "Auteur", type: "text" }, { key: "content", label: "Témoignage", type: "textarea" }, { key: "is_published", label: "Publié", type: "checkbox" }];
export default async function P() {
  const { data } = await supabaseAdmin().from("testimonials").select("*").order("created_at", { ascending: false });
  return (<><h1 className="mb-1 text-2xl font-extrabold">Témoignages</h1><p className="mb-4 text-sm text-white/60">Ajoute uniquement de vrais avis de clients.</p>
    <CrudManager table="testimonials" fields={fields} rows={data ?? []} blank={{ author: "", content: "", is_published: false }} /></>);
}
