import { createClient } from "@supabase/supabase-js";
// Clé service_role : à n’utiliser que dans les routes API serveur.
export const supabaseAdmin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
