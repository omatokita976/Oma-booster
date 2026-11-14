import Link from "next/link";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Logo from "@/components/Logo";
import { getSupabase } from "@/lib/supabase/server";
import { fcfa } from "@/lib/pricing";
export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const sb = await getSupabase(); const { data: { user } } = await sb.auth.getUser(); if (!user) redirect("/connexion");
  const { data: me } = await sb.from("profiles").select("balance").eq("id", user.id).single();
  return (
    <div className="min-h-screen pb-44">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink/90 px-4 py-3 backdrop-blur">
        <Link href="/dashboard/commander"><Logo size={30} /></Link>
        <Link href="/dashboard/portefeuille" className="flex items-center gap-2 rounded-full border border-line py-1 pl-4 pr-1 font-semibold">{fcfa(me?.balance ?? 0)}<span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-r from-volt to-neon text-xl">+</span></Link>
      </header>
      {children}<BottomNav />
    </div>);
}
