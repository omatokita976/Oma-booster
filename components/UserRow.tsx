"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fcfa } from "@/lib/pricing";
export type U = { id: string; email: string; name: string | null; role: string; balance: number; banned_until: string | null; banned_permanent: boolean; ban_reason: string | null };
export default function UserRow({ u }: { u: U }) {
  const router = useRouter();
  const [amount, setAmount] = useState(""); const [days, setDays] = useState("7"); const [reason, setReason] = useState(""); const [msg, setMsg] = useState("");
  const left = u.banned_until ? Math.ceil((new Date(u.banned_until).getTime() - Date.now()) / 864e5) : 0;
  const banned = u.banned_permanent || left > 0;
  async function act(body: object) {
    setMsg("…");
    const r = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id, reason, ...body }) });
    const j = await r.json(); setMsg(r.ok ? "OK" : j.error); if (r.ok) router.refresh();
  }
  return (
    <div className="card grid gap-3">
      <div className="flex flex-wrap justify-between gap-2"><div><b>{u.name || "—"}</b> <span className="text-white/60">{u.email}</span>{u.role === "admin" && <span className="ml-2 text-neon">admin</span>}</div>
        <div>Solde : <b>{fcfa(u.balance)}</b></div></div>
      <p className={banned ? "text-red-300" : "text-emerald-300"}>{u.banned_permanent ? "Banni définitivement" : left > 0 ? `Banni : ${left} jour(s) restant(s)` : "Actif"}{banned && u.ban_reason ? ` — ${u.ban_reason}` : ""}</p>
      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <input className="input" type="number" placeholder="Crédit en FCFA (négatif = retrait)" value={amount} onChange={e => setAmount(e.target.value)} />
        <button className="btn-primary !py-2" onClick={() => act({ action: "credit", amount: Number(amount) })}>Ajouter / retirer</button>
      </div>
      <div className="grid gap-2 md:grid-cols-[6rem_1fr_auto_auto]">
        <input className="input" type="number" min={1} value={days} onChange={e => setDays(e.target.value)} aria-label="Jours de bannissement" />
        <input className="input" placeholder="Motif (optionnel)" value={reason} onChange={e => setReason(e.target.value)} />
        <button className="btn-ghost !py-2" onClick={() => act({ action: "ban", days: Number(days) })}>Bannir {days || "?"} j</button>
        <button className="btn-ghost !py-2" onClick={() => act({ action: "ban", permanent: true })}>Définitif</button>
      </div>
      {banned && <button className="btn-ghost !py-2" onClick={() => act({ action: "unban" })}>Débannir</button>}
      {msg && <p className="text-sm text-neon">{msg}</p>}
    </div>);
}
