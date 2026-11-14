"use client";
import { supabaseBrowser } from "@/lib/supabase/client";
export default function LogoutButton() {
  return <button className="btn-ghost w-full" onClick={async () => { await supabaseBrowser().auth.signOut(); window.location.href = "/"; }}>Se déconnecter</button>;
}
