"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
type M = { id: string; is_admin: boolean; body: string; created_at: string };
export default function TicketThread({ id, subject, status, messages, admin }: { id: string; subject: string; status: string; messages: M[]; admin?: boolean }) {
  const router = useRouter(); const [body, setBody] = useState(""); const [msg, setMsg] = useState("");
  async function send(close = false) {
    const r = await fetch(admin ? "/api/admin/tickets" : "/api/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticketId: id, body, close }) });
    const j = await r.json(); if (r.ok) { setBody(""); router.refresh(); } else setMsg(j.error);
  }
  return (<div className="card"><div className="flex justify-between"><b>{subject}</b><span className="text-neon">{status === "open" ? "Ouvert" : status === "answered" ? "Répondu" : "Fermé"}</span></div>
    <div className="my-3 grid gap-2">{messages.map(m => <p key={m.id} className={`rounded-xl px-3 py-2 ${m.is_admin ? "bg-volt/20" : "bg-ink"}`}><span className="text-xs text-white/50">{m.is_admin ? "Support" : "Client"} · {new Date(m.created_at).toLocaleString("fr-FR")}</span><br />{m.body}</p>)}</div>
    {status !== "closed" || admin ? <div className="grid gap-2"><textarea className="input" rows={2} placeholder="Ta réponse…" value={body} onChange={e => setBody(e.target.value)} />
      <div className="flex gap-2"><button className="btn-primary !py-2" onClick={() => send()}>Envoyer</button>{admin && <button className="btn-ghost !py-2" onClick={() => send(true)}>Envoyer et fermer</button>}</div>{msg && <p className="text-sm text-red-300">{msg}</p>}</div> : <p className="text-sm text-white/50">Ticket fermé.</p>}</div>);
}
