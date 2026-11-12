import TicketThread from "@/components/TicketThread";
import { supabaseAdmin } from "@/lib/supabase/admin";
export default async function AdminSupport() {
  const db = supabaseAdmin();
  const [{ data: tickets }, { data: contacts }] = await Promise.all([
    db.from("tickets").select("id,subject,status,profiles(full_name),ticket_messages(id,is_admin,body,created_at)").order("created_at", { ascending: false }).limit(100),
    db.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(50),
  ]);
  return (<><h1 className="mb-4 text-2xl font-extrabold">Support</h1>
    <div className="grid gap-4">{tickets?.length ? tickets.map(t => <TicketThread key={t.id} admin id={t.id} subject={`${(t.profiles as unknown as { full_name: string } | null)?.full_name ?? ""} — ${t.subject}`} status={t.status} messages={[...t.ticket_messages].sort((a, b) => a.created_at.localeCompare(b.created_at))} />) : <p className="text-white/60">Aucun ticket.</p>}</div>
    <h2 className="mb-3 mt-8 text-xl font-bold">Messages du formulaire de contact</h2>
    <div className="grid gap-3">{contacts?.length ? contacts.map(c => <div key={c.id} className="card"><b>{c.name}</b> <span className="text-white/60">{c.email} {c.phone}</span><p>{c.message}</p></div>) : <p className="text-white/60">Aucun message.</p>}</div></>);
}
