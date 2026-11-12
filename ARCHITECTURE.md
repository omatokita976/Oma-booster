# OMA-BOOSTER — Architecture (conception : OMA TOKITA)

## Stack
Next.js (App Router, TypeScript) · Tailwind · Supabase (Auth + Postgres + RLS) · Vercel

## Principes de sécurité
- Le prix est **toujours recalculé côté serveur** : `total = ceil(quantité / 1000 × price_per_1000) − remise`.
- Commandes, paiements, promos et soldes : écrits uniquement par les routes `/api/*` avec `SUPABASE_SERVICE_ROLE_KEY` (jamais exposée au navigateur).
- Admin : rôle lu en base (`profiles.role`) et vérifié dans `middleware.ts` + chaque route `/api/admin/*`.
- Un paiement n'est « Payé » que lorsqu'un admin le confirme (`confirmed_by`, `confirmed_at`).
- Aucun mot de passe de réseau social n'est demandé : uniquement le lien public.

## Routes
Public : `/`, `/services`, `/services/[id]`, `/faq`, `/contact`, `/connexion`, `/inscription`
Client : `/dashboard`, `/dashboard/commandes`, `/dashboard/paiements`, `/dashboard/profil`, `/dashboard/support`
Admin : `/admin`, `/admin/services`, `/admin/commandes`, `/admin/paiements`, `/admin/utilisateurs`, `/admin/promos`, `/admin/temoignages`, `/admin/support`, `/admin/reglages`
API : `POST /api/orders`, `POST /api/payments`, `POST /api/promo/check`, `POST /api/tickets`, `POST /api/contact`, `/api/admin/*`

## Passerelle de paiement future
Colonne `payments.method = 'gateway'` + `gateway_ref`. Interface `PaymentProvider { createCharge(); verifyWebhook() }` ; le mode manuel MTN/Orange en est la première implémentation.

## Étapes de livraison
1. Schéma SQL + architecture ✅
2. Identité, layout, pages publiques, fiche service + commande
3. Auth + espace client
4. Espace admin
5. Support, README, vérifications
