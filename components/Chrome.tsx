"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
// Dans l’espace client (/dashboard) on affiche l’application (barre du bas), pas le site vitrine.
export default function Chrome({ nav, footer, extras, children }: { nav: ReactNode; footer: ReactNode; extras: ReactNode; children: ReactNode }) {
  const app = usePathname().startsWith("/dashboard");
  return <>{!app && nav}{children}{!app && footer}{!app && extras}</>;
}
