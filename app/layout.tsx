import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getSupabase } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "OMA-BOOSTER — Ta visibilité, notre priorité.", description: "Promotion et visibilité sur les réseaux sociaux." };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sb = await getSupabase();
  const { data } = await sb.from("site_settings").select("value").eq("key", "whatsapp_number").maybeSingle();
  return (
    <html lang="fr"><body>
      <Navbar />{children}<Footer /><WhatsAppButton number={data?.value} />
    </body></html>
  );
}
