"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function TopupForm({ mtn, orange }: { mtn: string; orange: string }) {
  const router = useRouter(); const [amount, setAmount] = useState(1000); const [method, setMethod] = useState("mtn_momo"); const [ref, setRef] = useState(""); const [phone, setPhone] = useState(""); const [msg, setMsg] = useState("");
  const dest = method === "mtn_momo" ? mtn : method === "orange_money" ? orange : "";
  async function go() {
    setMsg("…");
    const r = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topup: true, amount, method, reference: ref, payerPhone: phone }) });
    const j = await r.json();
    if (r.ok) { setMsg("Demande envoyée. Ton solde sera crédité après vérification du paiement."); setRef(""); router.refresh(); } else setMsg(j.error);
  }
  return (
    <div className="card grid gap-3"><h2 className="text-xl font-bold">Recharger mon solde</h2>
      <div className="grid grid-cols-4 gap-2">{[500, 1000, 2000, 5000].map(a => <button key={a} onClick={() => setAmount(a)} className={`rounded-xl border py-2 ${amount === a ? "border-neon bg-neon/10" : "border-line"}`}>{a}</button>)}</div>
      <input className="input" type="number" min={100} value={amount || ""} onChange={e => setAmount(parseInt(e.target.value, 10) || 0)} placeholder="Montant en FCFA" />
      <select className="input" value={method} onChange={e => setMethod(e.target.value)}><option value="mtn_momo">MTN Mobile Money</option><option value="orange_money">Orange Money</option><option value="manual_transfer">Transfert manuel</option></select>
      <p className="text-sm text-white/70">{dest ? `Envoie ${amount} FCFA au ${dest}, puis saisis l’ID de transaction reçu par SMS.` : "Effectue le transfert, puis saisis la référence (contacte le support pour les coordonnées)."}</p>
      <input className="input" placeholder="ID / référence de transaction" value={ref} onChange={e => setRef(e.target.value)} />
      <input className="input" placeholder="Numéro utilisé pour payer (optionnel)" value={phone} onChange={e => setPhone(e.target.value)} />
      <button className="btn-primary" onClick={go}>J’ai payé</button>{msg && <p className="text-neon">{msg}</p>}</div>);
}
