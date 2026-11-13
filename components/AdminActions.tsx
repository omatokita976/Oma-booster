"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
async function post(url: string, body: object) { const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return { ok: r.ok, j: await r.json() }; }
export function OrderStatus({ id, status }: { id: string; status: string }) {
  const router = useRouter(); const [s, setS] = useState(status); const [note, setNote] = useState(""); const [msg, setMsg] = useState("");
  async function save() { const { ok, j } = await post("/api/admin/orders", { orderId: id, status: s, note }); setMsg(ok ? "Enregistré" : j.error); if (ok) router.refresh(); }
  return (
    <div className="mt-3 grid gap-2 md:grid-cols-[auto_1fr_auto]">
      <select className="input" value={s} onChange={e => setS(e.target.value)}>
        {[["pending", "En attente"], ["accepted", "Acceptée"], ["processing", "En cours"], ["completed", "Terminée"], ["cancelled", "Annulée"], ["refused", "Refusée"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <input className="input" placeholder="Note (optionnel)" value={note} onChange={e => setNote(e.target.value)} />
      <button className="btn-primary !py-2" onClick={save}>Enregistrer</button>{msg && <p className="text-sm text-neon md:col-span-3">{msg}</p>}
    </div>);
}
export function PaymentButtons({ id }: { id: string }) {
  const router = useRouter(); const [msg, setMsg] = useState("");
  async function act(action: string) { const { ok, j } = await post("/api/admin/payments", { paymentId: id, action }); setMsg(ok ? "OK" : j.error); if (ok) router.refresh(); }
  return (<div className="mt-3 flex gap-2"><button className="btn-primary !py-2" onClick={() => act("confirm")}>Confirmer le paiement</button><button className="btn-ghost !py-2" onClick={() => act("reject")}>Refuser</button>{msg && <span className="self-center text-sm text-neon">{msg}</span>}</div>);
}
