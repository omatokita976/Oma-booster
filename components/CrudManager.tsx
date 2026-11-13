"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export type F = { key: string; label: string; type: "text" | "number" | "textarea" | "checkbox" | "date" | "select"; options?: string[]; readOnly?: boolean };
type Row = Record<string, any>;
function Editor({ table, fields, row, idKey, blank, canDelete }: { table: string; fields: F[]; row: Row; idKey: string; blank?: boolean; canDelete?: boolean }) {
  const router = useRouter(); const [v, setV] = useState<Row>(row); const [msg, setMsg] = useState("");
  async function call(op: string) {
    setMsg("…");
    const r = await fetch("/api/admin/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table, op, id: row[idKey], values: v }) });
    const j = await r.json(); setMsg(r.ok ? "OK" : j.error);
    if (r.ok) { if (blank) setV(row); router.refresh(); }
  }
  return (
    <div className="card grid gap-2 md:grid-cols-2">
      {fields.map(f => (
        <label key={f.key} className={`grid gap-1 text-sm ${f.type === "textarea" ? "md:col-span-2" : ""}`}><span className="text-white/60">{f.label}</span>
          {f.type === "textarea" ? <textarea className="input" rows={2} value={v[f.key] ?? ""} onChange={e => setV({ ...v, [f.key]: e.target.value })} />
            : f.type === "checkbox" ? <input type="checkbox" className="h-6 w-6" checked={!!v[f.key]} onChange={e => setV({ ...v, [f.key]: e.target.checked })} />
            : f.type === "select" ? <select className="input" value={v[f.key] ?? ""} onChange={e => setV({ ...v, [f.key]: e.target.value })}>{f.options!.map(o => <option key={o}>{o}</option>)}</select>
            : <input className="input" type={f.type} disabled={f.readOnly && !blank} value={f.type === "date" ? (v[f.key] ?? "").slice(0, 10) : v[f.key] ?? ""} onChange={e => setV({ ...v, [f.key]: e.target.value })} />}
        </label>))}
      <div className="flex items-center gap-2 md:col-span-2">
        <button className="btn-primary !py-2" onClick={() => call(blank ? "insert" : "update")}>{blank ? "Ajouter" : "Enregistrer"}</button>
        {!blank && canDelete && <button className="btn-ghost !py-2" onClick={() => confirm("Supprimer ?") && call("delete")}>Supprimer</button>}
        {msg && <span className="text-sm text-neon">{msg}</span>}</div>
    </div>);
}
export default function CrudManager({ table, fields, rows, idKey = "id", blank, canDelete = true }: { table: string; fields: F[]; rows: Row[]; idKey?: string; blank?: Row; canDelete?: boolean }) {
  return (<div className="grid gap-4">
    {blank && <div><h2 className="mb-2 font-bold">Nouveau</h2><Editor table={table} fields={fields} row={blank} idKey={idKey} blank /></div>}
    {rows.length ? rows.map(r => <Editor key={r[idKey]} table={table} fields={fields} row={r} idKey={idKey} canDelete={canDelete} />) : <p className="text-white/60">Rien pour l’instant.</p>}
  </div>);
}
