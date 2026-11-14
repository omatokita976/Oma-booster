"use client";
import Link from "next/link";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState("");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const sb = supabaseBrowser();
    if (mode === "signup") {
      const { data, error } = await sb.auth.signUp({ email, password, options: { data: { full_name: name } } });
      setBusy(false);
      if (error) return setMsg(error.message);
      if (!data.session) return setMsg("Compte créé. Vérifie ton e-mail pour confirmer, puis connecte-toi.");
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) { setBusy(false); return setMsg("E-mail ou mot de passe incorrect."); }
    }
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = next && next.startsWith("/") ? next : "/dashboard/commander";
  }
  return (
    <form onSubmit={submit} className="card mx-auto mt-12 grid max-w-md gap-4">
      <h1 className="text-2xl font-extrabold">{mode === "login" ? "Connexion" : "Créer un compte"}</h1>
      {mode === "signup" && <input className="input" placeholder="Nom complet" required value={name} onChange={e => setName(e.target.value)} />}
      <input className="input" type="email" placeholder="E-mail" required value={email} onChange={e => setEmail(e.target.value)} />
      <input className="input" type="password" placeholder="Mot de passe (8 caractères min.)" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} />
      {msg && <p className="text-sm text-neon">{msg}</p>}
      <button className="btn-primary" disabled={busy}>{busy ? "…" : mode === "login" ? "Se connecter" : "S’inscrire"}</button>
      <Link className="text-sm text-white/60 hover:text-neon" href={mode === "login" ? "/inscription" : "/connexion"}>{mode === "login" ? "Pas de compte ? Inscris-toi" : "Déjà un compte ? Connecte-toi"}</Link>
    </form>
  );
}
