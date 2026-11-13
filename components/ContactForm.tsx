"use client";
import { useState } from "react";
export default function ContactForm() {
  const [v, setV] = useState({ name: "", email: "", phone: "", message: "", website: "" }); const [msg, setMsg] = useState("");
  async function go(e: React.FormEvent) { e.preventDefault(); setMsg("…");
    const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) }); const j = await r.json();
    if (r.ok) { setMsg("Message envoyé. Nous te répondons rapidement."); setV({ name: "", email: "", phone: "", message: "", website: "" }); } else setMsg(j.error); }
  const set = (k: string) => (e: React.ChangeEvent<any>) => setV({ ...v, [k]: e.target.value });
  return (<form onSubmit={go} className="card grid gap-3">
    <input className="input" placeholder="Nom" required value={v.name} onChange={set("name")} /><input className="input" type="email" placeholder="E-mail" value={v.email} onChange={set("email")} />
    <input className="input" placeholder="Téléphone / WhatsApp" value={v.phone} onChange={set("phone")} /><textarea className="input" rows={4} placeholder="Ton message" required value={v.message} onChange={set("message")} />
    <input className="hidden" tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} aria-hidden />
    <button className="btn-primary">Envoyer</button>{msg && <p className="text-neon">{msg}</p>}</form>);
}
