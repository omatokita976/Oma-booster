"use client";
import Link from "next/link";
import { useState } from "react";
import { NETWORKS, fcfa } from "@/lib/pricing";
type S = { id: string; name: string; network: string; category: string; price_per_1000: number; min_qty: number; max_qty: number; eta: string | null };
export default function ServiceCatalog({ services, initial }: { services: S[]; initial?: string }) {
  const [q, setQ] = useState(""); const [net, setNet] = useState(initial && NETWORKS[initial] ? initial : "all");
  const list = services.filter(s => (net === "all" || s.network === net) && s.name.toLowerCase().includes(q.toLowerCase()));
  return (<>
    <input className="input" placeholder="Rechercher un service…" value={q} onChange={e => setQ(e.target.value)} />
    <div className="my-4 flex gap-2 overflow-x-auto pb-2">
      {["all", ...Object.keys(NETWORKS)].map(k => <button key={k} onClick={() => setNet(k)} className={`whitespace-nowrap rounded-full border px-4 py-1.5 ${net === k ? "border-neon bg-neon/10" : "border-line"}`}>{k === "all" ? "Tous" : NETWORKS[k]}</button>)}
    </div>
    {list.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(s => (
      <Link key={s.id} href={`/services/${s.id}`} className="card">
        <p className="text-sm text-neon">{NETWORKS[s.network]} · {s.category}</p><p className="mt-1 font-semibold">{s.name}</p>
        <p className="mt-3 text-white/70">{fcfa(s.price_per_1000)} / 1 000</p>
        <p className="text-xs text-white/50">{s.min_qty}–{s.max_qty} · {s.eta ?? "délai sur la fiche"}</p>
      </Link>))}</div> : <p className="text-white/60">Aucun service ne correspond à ta recherche.</p>}
  </>);
}
