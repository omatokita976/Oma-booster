import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { getSupabase } from "@/lib/supabase/server";
export default async function Plus() {
  const sb = await getSupabase(); const { data: { user } } = await sb.auth.getUser();
  const { data: me } = await sb.from("profiles").select("full_name,role").eq("id", user!.id).single();
  const items: [string, string][] = [["/dashboard/profil", "Mon profil et mot de passe"], ["/dashboard/paiements", "Historique des paiements"], ["/dashboard/support", "Support et tickets"], ["/faq", "FAQ"], ["/contact", "Nous contacter"]];
  return (
    <main className="mx-auto max-w-xl px-4 pt-6"><h1 className="text-3xl font-extrabold">{me?.full_name || "Mon compte"}</h1><p className="mb-5 text-white/60">{user?.email}</p>
      <div className="grid gap-3">{items.map(([h, t]) => <Link key={h} href={h} className="card flex justify-between"><span>{t}</span><span className="text-white/50">›</span></Link>)}
        {me?.role === "admin" && <Link href="/acces-admin" className="card flex justify-between"><span>Espace administrateur</span><span className="text-white/50">›</span></Link>}
        <LogoutButton /></div></main>);
}
