"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function MfaSetup() {
  const [factorId, setFactorId] = useState(""); const [qr, setQr] = useState(""); const [secret, setSecret] = useState("");
  const [code, setCode] = useState(""); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { (async () => {
    const sb = supabaseBrowser(); const { data } = await sb.auth.mfa.listFactors();
    const ok = data?.totp?.[0]; if (ok) return setFactorId(ok.id);
    for (const f of data?.all ?? []) if (f.status === "unverified") await sb.auth.mfa.unenroll({ factorId: f.id });
    const { data: e, error } = await sb.auth.mfa.enroll({ factorType: "totp" });
    if (error || !e) return setMsg("Impossible d’activer la 2FA : vérifie que le MFA TOTP est activé dans Supabase.");
    setFactorId(e.id); setQr(e.totp.qr_code); setSecret(e.totp.secret);
  })(); }, []);
  async function verify(ev: React.FormEvent) {
    ev.preventDefault(); setBusy(true); setMsg(""); const sb = supabaseBrowser();
    const { data: ch, error } = await sb.auth.mfa.challenge({ factorId });
    const r = error || !ch ? { error } : await sb.auth.mfa.verify({ factorId, challengeId: ch.id, code: code.trim() });
    setBusy(false); if (r.error) return setMsg("Code incorrect."); window.location.href = "/admin";
  }
  return (
    <form onSubmit={verify} className="card mx-auto mt-12 grid max-w-md gap-4">
      <h1 className="text-2xl font-extrabold">Vérification administrateur</h1>
      {qr && <><p className="text-sm text-white/70">Scanne ce QR code avec une application d’authentification (Google Authenticator, Authy…), puis saisis le code à 6 chiffres.</p>
        <img src={qr} alt="QR code 2FA" className="mx-auto h-44 w-44 rounded-xl bg-white p-2" /><p className="break-all text-center text-xs text-white/50">Clé manuelle : {secret}</p></>}
      {!qr && factorId && <p className="text-sm text-white/70">Saisis le code à 6 chiffres de ton application d’authentification.</p>}
      <input className="input text-center tracking-widest" inputMode="numeric" maxLength={6} placeholder="000000" required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} />
      {msg && <p className="text-sm text-red-300">{msg}</p>}<button className="btn-primary" disabled={busy || !factorId}>{busy ? "…" : "Valider"}</button>
    </form>);
}
