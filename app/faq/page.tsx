export const metadata = { title: "FAQ — OMA-BOOSTER" };
const faq = [
  ["Dois-je donner mon mot de passe ?", "Non, jamais. Seul le lien public de ta publication, de ton profil ou de ta chaîne est nécessaire."],
  ["Comment payer ?", "Par MTN Mobile Money, Orange Money ou transfert. Après ton paiement, saisis l’ID de transaction : un administrateur vérifie la réception avant de lancer la commande."],
  ["Pourquoi ma commande est « En attente » ?", "Elle attend la confirmation de ton paiement par notre équipe."],
  ["Puis-je utiliser un code promo ?", "Oui, saisis-le sur la fiche du service. Il est vérifié au moment de la commande."],
  ["Comment contacter le support ?", "Depuis ton espace client (tickets), le formulaire de contact ou le bouton WhatsApp."],
  ["Mon compte est suspendu, que faire ?", "Ouvre un ticket ou contacte-nous sur WhatsApp pour connaître le motif."],
];
export default function Faq() { return <main className="mx-auto max-w-3xl px-4 py-10"><h1 className="mb-6 text-3xl font-extrabold">Questions fréquentes</h1><div className="grid gap-3">{faq.map(([q, a]) => <details key={q} className="card"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-white/70">{a}</p></details>)}</div></main>; }
