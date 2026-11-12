import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { getSupabase } from "@/lib/supabase/server";
export default async function Profil() {
  const sb = await getSupabase(); const { data: { user } } = await sb.auth.getUser(); if (!user) redirect("/connexion");
  const { data: p } = await sb.from("profiles").select("full_name,phone").eq("id", user.id).single();
  return (<main className="mx-auto max-w-md px-4 py-10"><h1 className="mb-1 text-3xl font-extrabold">Mon profil</h1><p className="mb-4 text-white/60">{user.email}</p><ProfileForm id={user.id} name={p?.full_name ?? ""} phone={p?.phone ?? ""} /></main>);
}
