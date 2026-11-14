export default function WhatsAppButton({ number }: { number?: string }) {
  const n = (number || "").replace(/\D/g, "");
  if (!n) return null; // numéro à renseigner dans Admin > Réglages
  return (
    <a href={`https://wa.me/${n}`} target="_blank" rel="noopener noreferrer" aria-label="Écrire sur WhatsApp"
       className="fixed bottom-6 right-5 z-50 rounded-full bg-[#25D366] px-5 py-3 font-bold text-black shadow-glow">WhatsApp</a>
  );
}
