"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { computeTotal, fcfa } from "@/lib/pricing";
type S = { id: string; name: string; price_per_1000: number; min_qty: number; max_qty: number; link_hint: string | null };
export default function OrderForm({ s }: { s: S }) {
  const router = useRouter();
  const [qty, setQty] = useState(s.min_qty); const [link, setLink] = useState(""); const [promo, setPromo] = useState("");
  const [step, setStep] = useState<"form" | "recap">("form"); const [useBalance, setUseBalance] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const qtyOk = Number.isInteger(qty) && qty >= s.min_qty && qty <= s.max_qty;
  const linkOk = /^https:\/\/\S+\.\S+/.test(link);
  const total = computeTotal(qty || 0, s.price_per_1000);
  async function submit() {
    setBusy(true); setErr("");
    const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceId: s.id, link, quantity: qty, promoCode: promo || undefined, useBalance }) });
    const j = await r.json(); setBusy(false);
    if (r.status === 401) return router.push(`/connexion?next=/services/${s.id}`);
    if (!r.ok) return setErr(j.error ?? "Erreur"); 
    router.push(`/dashboard/commandes?new=${j.publicId}`);
  }
  if (step === "recap") return (
    <div className="card rise"><h2 className="text-xl font-bold">Récapitulatif</h2>
      <dl className="mt-4 grid gap-2 text-white/80"><div>Service : {s.name}</div><div className="break-all">Lien : {link}</div><div>Quantité : {qty}</div>{promo && <div>Code promo : {promo} (vérifié à la validation)</div>}<div className="text-lg font-bold text-white">Total estimé : {fcfa(total)}</div></dl>
      {err && <p className="mt-3 text-red-400">{err}</p>}
      <div className="mt-5 flex gap-3"><button className="btn-ghost" onClick={() => setStep("form")}>Modifier</button><button className="btn-primary flex-1" disabled={busy} onClick={submit}>{busy ? "Envoi…" : "Confirmer la commande"}</button></div>
    </div>);
  return (
    <div className="card grid gap-4">
      <label className="grid gap-1">Lien {s.link_hint && <span className="text-xs text-white/50">({s.link_hint})</span>}<input className="input" placeholder="https://…" value={link} onChange={e => setLink(e.target.value.trim())} /></label>
      <label className="grid gap-1">Quantité ({s.min_qty} – {s.max_qty})<input className="input" type="number" min={s.min_qty} max={s.max_qty} value={qty || ""} onChange={e => setQty(parseInt(e.target.value, 10))} /></label>
      <label className="grid gap-1">Code promo (optionnel)<input className="input" value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={useBalance} onChange={e => setUseBalance(e.target.checked)} /> Payer avec mon solde</label>
      <p className="text-2xl font-extrabold">{qtyOk ? fcfa(total) : "—"}</p>
      <button className="btn-primary disabled:opacity-40" disabled={!qtyOk || !linkOk} onClick={() => setStep("recap")}>Commander</button>
      {!linkOk && link && <p className="text-sm text-red-400">Le lien doit commencer par https://</p>}
    </div>);
}
