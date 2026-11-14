"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NETWORKS, computeTotal, fcfa } from "@/lib/pricing";
export type S = { id: string; network: string; name: string; group_title: string | null; option_label: string | null; price_per_1000: number; min_qty: number; max_qty: number; eta: string | null; link_hint: string | null };
const TILE: Record<string, [string, string]> = { facebook: ["#1877F2", "f"], instagram: ["#E1306C", "IG"], tiktok: ["#161616", "Tk"], youtube: ["#E11", "▶"], x: ["#000", "X"], threads: ["#222", "@"], telegram: ["#27A7E7", "✈"], whatsapp: ["#25D366", "W"] };
const Tile = ({ n, size = 56 }: { n: string; size?: number }) => <span className="grid place-items-center rounded-2xl font-extrabold text-white" style={{ background: TILE[n][0], width: size, height: size, fontSize: size / 2.6 }}>{TILE[n][1]}</span>;

export default function OrderWizard({ services, balance }: { services: S[]; balance: number }) {
  const router = useRouter();
  const [step, setStep] = useState(1); const [net, setNet] = useState<string | null>(null); const [group, setGroup] = useState<string | null>(null);
  const [svc, setSvc] = useState<S | null>(null); const [qty, setQty] = useState(0); const [link, setLink] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const nets = Object.keys(NETWORKS).filter(n => services.some(s => s.network === n));
  const groups = new Map<string, S[]>();
  services.filter(s => s.network === net).forEach(s => { const g = s.group_title ?? s.name; groups.set(g, [...(groups.get(g) ?? []), s]); });
  const total = svc ? computeTotal(qty || 0, svc.price_per_1000) : 0;
  const qtyOk = !!svc && Number.isInteger(qty) && qty >= svc.min_qty && qty <= svc.max_qty;
  const linkOk = /^https:\/\/\S+\.\S+/.test(link);
  const missing = Math.max(0, total - balance);
  const pick = (s: S) => { setSvc(s); setQty(s.min_qty); setStep(3); };
  const back = () => { if (step === 3) { setSvc(null); setStep(2); } else if (step === 2 && group) setGroup(null); else setStep(step - 1); setErr(""); };
  const stepSize = svc ? Math.max(1, Math.round(svc.min_qty / 10)) : 1;
  const presets = svc ? [1, 5, 10, 25].map(m => svc.min_qty * m).filter(q => q <= svc.max_qty) : [];
  async function paste() { try { setLink((await navigator.clipboard.readText()).trim()); } catch { setErr("Collage refusé : colle le lien manuellement."); } }
  async function order() {
    if (!svc) return; setBusy(true); setErr("");
    const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceId: svc.id, link, quantity: qty, useBalance: true }) });
    const j = await r.json(); setBusy(false);
    if (r.status === 401) return router.push("/connexion?next=/dashboard/commander");
    if (!r.ok) return setErr(j.error ?? "Erreur"); router.push(`/dashboard/commandes?new=${j.publicId}`); router.refresh();
  }
  const Summary = () => net && svc ? (
    <div className="card mb-5 flex items-center gap-3"><Tile n={net} size={48} />
      <div className="min-w-0 flex-1"><p className="font-bold">{NETWORKS[net]}</p><p className="truncate text-white/80">{svc.group_title ?? svc.name}</p><p className="text-sm text-white/50">{svc.option_label}{svc.eta ? ` · ${svc.eta}` : ""}</p></div>
      <button className="font-semibold text-neon" onClick={() => { setStep(2); setSvc(null); setGroup(null); }}>Changer</button></div>) : null;

  return (
    <main className="mx-auto max-w-xl px-4 pt-5">
      <div className="mb-5 flex items-center gap-3">
        {step > 1 && <button aria-label="Retour" onClick={back} className="text-2xl">‹</button>}
        <div className="flex-1"><p className="mb-2 text-white/60">Étape {step} sur 4</p>
          <div className="grid grid-cols-4 gap-2">{[1, 2, 3, 4].map(i => <span key={i} className={`h-1.5 rounded-full ${i <= step ? "bg-neon" : "bg-line"}`} />)}</div></div></div>

      {step === 1 && <><h1 className="mb-5 text-3xl font-extrabold">Que veux-tu faire grandir ?</h1>
        <div className="grid grid-cols-3 gap-3">{nets.map(n => <button key={n} onClick={() => { setNet(n); setGroup(null); setStep(2); }} className="card flex flex-col items-center gap-2 !p-4"><Tile n={n} /><span className="font-semibold">{NETWORKS[n]}</span></button>)}</div>
        {!nets.length && <p className="text-white/60">Le catalogue sera bientôt disponible.</p>}</>}

      {step === 2 && net && !group && <><h1 className="mb-5 text-3xl font-extrabold">{NETWORKS[net]} : que veux-tu promouvoir ?</h1>
        <div className="grid gap-3">{[...groups.entries()].map(([g, list]) => {
          const min = Math.min(...list.map(s => s.price_per_1000));
          return <button key={g} onClick={() => list.length === 1 ? pick(list[0]) : setGroup(g)} className="card flex items-center justify-between text-left"><span><b>{g}</b><br /><span className="text-white/60">{fcfa(min)} pour 1 000{list.length > 1 ? ` · ${list.length} options` : ""}</span></span><span className="text-2xl text-white/50">›</span></button>; })}</div></>}

      {step === 2 && net && group && <><h1 className="mb-1 text-3xl font-extrabold">Choisis une option</h1><p className="mb-5 text-white/60">{group}</p>
        <div className="grid gap-3">{groups.get(group)!.map(s => <button key={s.id} onClick={() => pick(s)} className="card flex items-center justify-between text-left"><span><b>{s.option_label ?? s.name}</b><br /><span className="text-white/60">Délai moyen : {s.eta ?? "—"}</span></span><span className="text-right"><b>{fcfa(s.price_per_1000)}</b><br /><span className="text-sm text-white/50">pour 1 000</span></span></button>)}</div></>}

      {step === 3 && svc && <><Summary /><h1 className="mb-4 text-3xl font-extrabold">Combien ?</h1>
        <div className="grid grid-cols-2 gap-3">{presets.map(q => <button key={q} onClick={() => setQty(q)} className={`card !p-4 text-center ${qty === q ? "!border-neon" : ""}`}><b className="text-2xl">{new Intl.NumberFormat("fr-FR").format(q)}</b><br /><span className="text-white/60">{fcfa(computeTotal(q, svc.price_per_1000))}</span></button>)}</div>
        <div className="mb-2 mt-5 flex justify-between"><b>Ou écris ta quantité :</b><span className="text-white/50">{svc.min_qty} – {new Intl.NumberFormat("fr-FR").format(svc.max_qty)}</span></div>
        <div className="grid grid-cols-[3.5rem_1fr_3.5rem] gap-2">
          <button className="card !p-0 text-2xl" onClick={() => setQty(Math.max(svc.min_qty, (qty || 0) - stepSize))}>−</button>
          <input className="input text-center text-xl" type="number" inputMode="numeric" value={qty || ""} onChange={e => setQty(parseInt(e.target.value, 10) || 0)} />
          <button className="card !p-0 text-2xl" onClick={() => setQty(Math.min(svc.max_qty, (qty || 0) + stepSize))}>＋</button></div>
        {qty > 0 && !qtyOk && <p className="mt-2 text-sm text-red-300">Entre {svc.min_qty} et {svc.max_qty}.</p>}</>}

      {step === 4 && svc && <><Summary /><h1 className="mb-4 text-3xl font-extrabold">Colle ton lien</h1>
        <label className="mb-2 block text-white/70">{svc.link_hint ?? "Lien"}</label>
        <input className="input" placeholder="https://…" value={link} onChange={e => setLink(e.target.value.trim())} />
        <button className="btn-ghost mt-3 w-full" onClick={paste}>Coller le lien</button>
        {link && !linkOk && <p className="mt-2 text-sm text-red-300">Le lien doit commencer par https://</p>}
        <p className="mt-4 text-sm text-white/50">Nous ne demandons jamais tes mots de passe.</p></>}

      {err && <p className="mt-4 text-red-300">{err}</p>}

      {step >= 3 && svc && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-neon/40 bg-ink/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto max-w-xl">
            {step === 4 && missing > 0 && <p className="mb-2 rounded-xl bg-amber-900/40 p-3 text-amber-100">Ton solde est de {fcfa(balance)}. Ajoute {fcfa(missing)} pour passer cette commande.</p>}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0"><p className="truncate text-sm text-white/60">{qty || 0} · {svc.group_title ?? svc.name}</p><p className="text-2xl font-extrabold">{qtyOk ? fcfa(total) : "—"}</p></div>
              {step === 3 && <button className="btn-primary px-8 disabled:opacity-40" disabled={!qtyOk} onClick={() => setStep(4)}>Suivant ›</button>}
              {step === 4 && (missing > 0 ? <Link href="/dashboard/portefeuille" className="btn-primary px-8">Recharger ›</Link>
                : <button className="btn-primary px-8 disabled:opacity-40" disabled={!linkOk || busy} onClick={order}>{busy ? "…" : "Commander ›"}</button>)}
            </div></div></div>)}
    </main>);
}
