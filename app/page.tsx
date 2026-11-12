import Link from "next/link";
import { getSupabase } from "@/lib/supabase/server";
import { NETWORKS, fcfa } from "@/lib/pricing";
export const revalidate = 60;
const steps = [["1", "Choisis un service", "Parcours le catalogue par réseau social."], ["2", "Colle ton lien", "Publication, profil ou chaîne : jamais de mot de passe."], ["3", "Paie en FCFA", "MTN Mobile Money, Orange Money ou transfert."], ["4", "Suis ta commande", "Statut mis à jour dans ton tableau de bord."]];
const perks = ["Prix clairs, calculés automatiquement", "Aucune demande de mot de passe", "Paiements vérifiés par un humain", "Support par ticket et WhatsApp"];
const faq = [["Dois-je donner mon mot de passe ?", "Non, jamais. Seul le lien public est nécessaire."], ["Comment payer ?", "Par MTN Mobile Money, Orange Money ou transfert. Ta commande démarre après confirmation du paiement."], ["Combien de temps ça prend ?", "Le délai estimé est affiché sur chaque fiche service."]];
export default async function Home() {
  const sb = await getSupabase();
  const [{ data: popular }, { data: tests }] = await Promise.all([
    sb.from("services").select("id,name,network,price_per_1000").eq("is_active", true).order("sort_order").limit(6),
    sb.from("testimonials").select("author,content").eq("is_published", true).limit(3),
  ]);
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="py-20 text-center rise">
        <p className="mb-4 inline-block rounded-full border border-line px-4 py-1 text-sm text-neon">Ta visibilité, notre priorité.</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">Développe ta présence digitale avec <span className="bg-gradient-to-r from-volt to-neon bg-clip-text text-transparent">OMA-BOOSTER</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-white/70">Promotion et croissance sur tes réseaux sociaux, avec des prix en FCFA et un paiement adapté au Cameroun.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/services" className="btn-primary">Commander maintenant</Link>
          <Link href="/services" className="btn-ghost">Découvrir nos services</Link>
        </div>
      </section>
      <section className="flex flex-wrap justify-center gap-3">
        {Object.entries(NETWORKS).map(([k, n]) => <Link key={k} href={`/services?network=${k}`} className="rounded-full border border-line px-5 py-2 hover:border-neon">{n}</Link>)}
      </section>
      <section className="mt-20"><h2 className="mb-6 text-2xl font-bold">Services populaires</h2>
        {popular?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{popular.map(s => (
          <Link key={s.id} href={`/services/${s.id}`} className="card"><p className="text-sm text-neon">{NETWORKS[s.network]}</p><p className="mt-1 font-semibold">{s.name}</p><p className="mt-3 text-white/60">{fcfa(s.price_per_1000)} / 1 000</p></Link>))}</div>
          : <p className="text-white/60">Le catalogue sera bientôt disponible.</p>}
      </section>
      <section id="comment" className="mt-20"><h2 className="mb-6 text-2xl font-bold">Comment ça marche</h2>
        <div className="grid gap-4 md:grid-cols-4">{steps.map(([n, t, d]) => <div key={n} className="card"><span className="text-3xl font-black text-volt">{n}</span><p className="mt-2 font-semibold">{t}</p><p className="text-sm text-white/60">{d}</p></div>)}</div>
      </section>
      <section className="mt-20"><h2 className="mb-6 text-2xl font-bold">Pourquoi OMA-BOOSTER</h2>
        <div className="grid gap-4 sm:grid-cols-2">{perks.map(p => <div key={p} className="card">✓ {p}</div>)}</div>
      </section>
      <section className="mt-20"><h2 className="mb-6 text-2xl font-bold">Témoignages</h2>
        {tests?.length ? <div className="grid gap-4 md:grid-cols-3">{tests.map((t, i) => <div key={i} className="card"><p>“{t.content}”</p><p className="mt-3 text-sm text-neon">{t.author}</p></div>)}</div>
          : <p className="text-white/60">Les premiers avis clients apparaîtront ici.</p>}
      </section>
      <section className="mt-20"><h2 className="mb-6 text-2xl font-bold">FAQ</h2>
        <div className="grid gap-3">{faq.map(([q, a]) => <details key={q} className="card"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-white/70">{a}</p></details>)}</div>
      </section>
    </main>
  );
}
