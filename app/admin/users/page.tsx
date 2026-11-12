import UserRow, { type U } from "@/components/UserRow";
import { supabaseAdmin } from "@/lib/supabase/admin";
export default async function AdminUsers() {
  const db = supabaseAdmin();
  const [{ data: profiles }, { data: auth }] = await Promise.all([
    db.from("profiles").select("id,full_name,role,balance,banned_until,banned_permanent,ban_reason").order("created_at", { ascending: false }),
    db.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const emails = new Map(auth?.users.map(u => [u.id, u.email ?? ""]));
  const users: U[] = (profiles ?? []).map(p => ({ id: p.id, email: emails.get(p.id) ?? "", name: p.full_name, role: p.role, balance: p.balance, banned_until: p.banned_until, banned_permanent: p.banned_permanent, ban_reason: p.ban_reason }));
  return (<><h1 className="mb-4 text-2xl font-extrabold">Utilisateurs ({users.length})</h1>
    <div className="grid gap-4">{users.map(u => <UserRow key={u.id} u={u} />)}</div></>);
}
