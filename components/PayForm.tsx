"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function PayForm({ orderId, mtn, orange }: { orderId: string; mtn: string; orange: string }) {
  const router = useRouter();
  const [method, setMethod] = useState("mtn_momo"); const [ref, setRef] = useState(""); const [phone, setPhone] = useState(""); const [msg, setMsg] = useState("");
  const dest = method === "mtn_momo" ? mtn : method === "orange_money" ? orange : "";
  async function go() {
    setMsg("…");
    const r = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, method, reference: ref, payerPhone: phone }) });
    const j = await r.json(); if (r.ok) router.refresh(); else setMsg(j.error);
  }
  return (
    <div className="mt-3 grid gap-2 rounded-xl border border-line p-3">
      <select className="input" value={method} onChange={e => setMethod(e.target.value)}>
        <option value="mtn_momo">MTN Mobile Money</option><option value="orange_money">Orange Money</option><option value="manual_transfer">Transfert manuel</option></select>
      <p className="text-sm text-white/70">{dest ? `Envoie le montant au ${dest}, puis saisis l’ID de transaction reçu par SMS.` : "Effectue le transfert, puis saisis la référence (contacte le support pour les coordonnées)."}</p>
      <input className="input" placeholder="ID / référence de transaction" value={ref} onChange={e => setRef(e.target.value)} />
      <input className="input" placeholder="Numéro utilisé pour payer (optionnel)" value={phone} onChange={e => setPhone(e.target.value)} />
      <button className="btn-primary !py-2" onClick={go}>J’ai payé</button>{msg && <p className="text-sm text-red-300">{msg}</p>}
    </div>);
}
