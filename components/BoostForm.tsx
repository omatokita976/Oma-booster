"use client";
import { useState } from "react";
type S = { id: string; name: string; network: string; max_qty: number };
export default function BoostForm({ services }: { services: S[] }) {
  const [id, setId] = useState(services[0]?.id ?? ""); const [link, setLink] = useState(""); const [qty, setQty] = useState("1000"); const [msg, setMsg] = useState("");
  async function go() {
    setMsg("…");
    const r = await fetch("/api/admin/boost", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceId: id, link, quantity: Number(qty) }) });
    const j = await r.json(); setMsg(r.ok ? `Commande gratuite ${j.publicId} créée.` : j.error);
  }
  return (
    <div className="card grid max-w-lg gap-3">
      <select className="input" value={id} onChange={e => setId(e.target.value)}>{services.map(s => <option key={s.id} value={s.id}>{s.network} — {s.name}</option>)}</select>
      <input className="input" placeholder="https://…" value={link} onChange={e => setLink(e.target.value.trim())} />
      <input className="input" type="number" min={1} value={qty} onChange={e => setQty(e.target.value)} />
      <button className="btn-primary" onClick={go}>Lancer mon boost (gratuit)</button>{msg && <p className="text-neon">{msg}</p>}
    </div>);
}
