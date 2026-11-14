"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const tabs = [["/dashboard/commander", "＋", "Commander"], ["/dashboard/commandes", "≡", "Mes commandes"], ["/dashboard/portefeuille", "◧", "Portefeuille"], ["/dashboard/plus", "☰", "Plus"]];
export default function BottomNav() {
  const p = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t border-line bg-ink/95 backdrop-blur">
      {tabs.map(([h, i, t]) => <Link key={h} href={h} className={`flex flex-col items-center justify-center text-xs ${p.startsWith(h) ? "text-neon" : "text-white/60"}`}><span className="text-xl leading-none">{i}</span>{t}</Link>)}
    </nav>
  );
}
