import { notFound } from "next/navigation";
import MfaSetup from "@/components/MfaSetup";
import { getAdminBasic } from "@/lib/admin";
export const metadata = { robots: { index: false, follow: false } };
export default async function Acces() { if (!(await getAdminBasic())) notFound(); return <main className="px-4"><MfaSetup /></main>; }
