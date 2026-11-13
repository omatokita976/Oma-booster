// Calcul unique du prix (FCFA). Utilisé par le client (aperçu) ET le serveur (source de vérité).
export function computeTotal(quantity: number, pricePer1000: number, discount = 0): number {
  return Math.max(0, Math.ceil((quantity * pricePer1000) / 1000) - discount);
}
export const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
export const NETWORKS: Record<string, string> = {
  facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube",
  x: "X", threads: "Threads", telegram: "Telegram", whatsapp: "WhatsApp",
};
