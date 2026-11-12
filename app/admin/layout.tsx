import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/admin";
export const metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await getAdmin())) notFound(); // la section n’existe pas pour un non-admin
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-6 flex flex-wrap gap-3 border-b border-line pb-3"><Link className="btn-ghost !py-2" href="/admin">Accueil</Link><Link className="btn-ghost !py-2" href="/admin/orders">Commandes</Link><Link className="btn-ghost !py-2" href="/admin/payments">Paiements</Link><Link className="btn-ghost !py-2" href="/admin/users">Utilisateurs</Link><Link className="btn-ghost !py-2" href="/admin/services">Services</Link><Link className="btn-ghost !py-2" href="/admin/promos">Promos</Link><Link className="btn-ghost !py-2" href="/admin/testimonials">Témoignages</Link><Link className="btn-ghost !py-2" href="/admin/support">Support</Link><Link className="btn-ghost !py-2" href="/admin/settings">Réglages</Link><Link className="btn-ghost !py-2" href="/admin/boost">Me booster</Link></nav>
      {children}
    </div>);
}
