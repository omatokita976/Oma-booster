import Link from "next/link";
import Logo from "./Logo";
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div><Logo /><p className="mt-3 text-sm text-white/60">Ta visibilité, notre priorité.</p></div>
        <div className="grid gap-2 text-sm text-white/70">
          <Link href="/services">Services</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link><Link href="/connexion">Espace client</Link>
        </div>
        <p className="text-sm text-white/60">Paiement : MTN Mobile Money, Orange Money, transfert. Nous ne demandons jamais tes mots de passe.</p>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-white/50">© {new Date().getFullYear()} OMA-BOOSTER — Conception : OMA TOKITA</div>
    </footer>
  );
}
