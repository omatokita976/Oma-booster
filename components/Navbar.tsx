"use client";
import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
const links = [["/services", "Services"], ["/#comment", "Comment ça marche"], ["/faq", "FAQ"], ["/contact", "Contact"]];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/"><Logo /></Link>
        <div className="hidden items-center gap-6 md:flex">
          {links.map(([h, t]) => <Link key={h} href={h} className="text-white/80 hover:text-neon">{t}</Link>)}
          <Link href="/connexion" className="btn-ghost !py-2">Connexion</Link>
          <Link href="/services" className="btn-primary !py-2">Commander</Link>
        </div>
        <button aria-label="Menu" className="md:hidden rounded-lg border border-line p-2" onClick={() => setOpen(!open)}>
          <span className="block h-0.5 w-6 bg-white mb-1.5" /><span className="block h-0.5 w-6 bg-white mb-1.5" /><span className="block h-0.5 w-6 bg-white" />
        </button>
      </nav>
      {open && (
        <div className="grid gap-1 border-t border-line px-4 pb-4 md:hidden rise">
          {links.map(([h, t]) => <Link key={h} href={h} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 hover:bg-panel">{t}</Link>)}
          <Link href="/connexion" onClick={() => setOpen(false)} className="btn-ghost mt-2">Connexion</Link>
          <Link href="/services" onClick={() => setOpen(false)} className="btn-primary">Commander maintenant</Link>
        </div>
      )}
    </header>
  );
}
