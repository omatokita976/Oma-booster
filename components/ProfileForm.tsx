"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function ProfileForm({ id, name, phone }: { id: string; name: string; phone: string }) {
  const [n, setN] = useState(name); const [p, setP] = useState(phone); const [pw, setPw] = useState(""); const [msg, setMsg] = useState("");
  async function saveProfile() { const { error } = await supabaseBrowser().from("profiles").update({ full_name: n, phone: p }).eq("id", id); setMsg(error ? "Erreur d’enregistrement" : "Profil enregistré"); }
  async function savePw() { if (pw.length < 8) return setMsg("8 caractères minimum"); const { error } = await supabaseBrowser().auth.updateUser({ password: pw }); setMsg(error ? error.message : "Mot de passe modifié"); setPw(""); }
  return (<div className="grid gap-4"><div className="card grid gap-2"><input className="input" value={n} onChange={e => setN(e.target.value)} placeholder="Nom" /><input className="input" value={p} onChange={e => setP(e.target.value)} placeholder="Téléphone" /><button className="btn-primary !py-2" onClick={saveProfile}>Enregistrer</button></div>
    <div className="card grid gap-2"><input className="input" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Nouveau mot de passe" /><button className="btn-ghost !py-2" onClick={savePw}>Changer le mot de passe</button></div>{msg && <p className="text-neon">{msg}</p>}</div>);
}
