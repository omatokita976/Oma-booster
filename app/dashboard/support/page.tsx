import { redirect } from "next/navigation";
import NewTicket from "@/components/NewTicket";
import TicketThread from "@/components/TicketThread";
import { getSupabase } from "@/lib/supabase/server";
export default async function Support() {
  const sb = await getSupabase(); const { data: { user } } = await sb.auth.getUser(); if (!user) redirect("/connexion");
  const { data: tickets } = await sb.from("tickets").select("id,subject,status,ticket_messages(id,is_admin,body,created_at)").eq("user_id", user.id).order("created_at", { ascending: false });
  return (<main className="mx-auto max-w-3xl px-4 py-10"><h1 className="mb-4 text-3xl font-extrabold">Support</h1><NewTicket />
    <h2 className="mb-3 mt-8 text-xl font-bold">Mes conversations</h2>
    <div className="grid gap-4">{tickets?.length ? tickets.map(t => <TicketThread key={t.id} id={t.id} subject={t.subject} status={t.status} messages={[...t.ticket_messages].sort((a, b) => a.created_at.localeCompare(b.created_at))} />) : <p className="text-white/60">Aucun ticket pour l’instant.</p>}</div></main>);
}
