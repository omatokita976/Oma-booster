import { getSupabase } from "./supabase/server";
import { supabaseAdmin } from "./supabase/admin";
export const adminEmails = () => (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

// Niveau 1 : e-mail sur liste blanche (ADMIN_EMAILS) + rôle admin en base. Échec fermé si la variable est absente.
export async function getAdminBasic() {
  const sb = await getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user?.email || !adminEmails().includes(user.email.toLowerCase())) return null;
  const { data: p } = await supabaseAdmin().from("profiles").select("role").eq("id", user.id).maybeSingle();
  return p?.role === "admin" ? { user, sb } : null;
}
// Niveau 2 (utilisé partout : pages et API admin) : en plus, session validée par code 2FA (aal2).
export async function getAdmin() {
  const a = await getAdminBasic(); if (!a) return null;
  const { data } = await a.sb.auth.mfa.getAuthenticatorAssuranceLevel();
  return data?.currentLevel === "aal2" ? a.user : null;
}
