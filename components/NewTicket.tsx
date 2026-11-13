"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function NewTicket() {
  const router = useRouter(); const [subject, setSubject] = useState(""); const [body, setBody] = useState(""); const [msg, setMsg] = useState("");
  async function go() { const r = await fetch("/api/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, body }) }); const j = await r.json(); if (r.ok) { setSubject(""); setBody(""); setMsg(""); router.refresh(); } else setMsg(j.error); }
  return (<div className="card grid gap-2"><h2 className="font-bold">Nouveau ticket</h2><input className="input" placeholder="Sujet (ex. commande OB-1001)" value={subject} onChange={e => setSubject(e.target.value)} />
    <textarea className="input" rows={3} placeholder="Décris ton problème" value={body} onChange={e => setBody(e.target.value)} /><button className="btn-primary !py-2" onClick={go}>Ouvrir le ticket</button>{msg && <p className="text-sm text-red-300">{msg}</p>}</div>);
}
