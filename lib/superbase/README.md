# OMA-BOOSTER — Ta visibilité, notre priorité.
Conception : OMA TOKITA

## 1. Supabase
1. Crée un projet sur supabase.com.
2. SQL Editor : exécute dans l’ordre `supabase/schema.sql`, `supabase/002_admin.sql`, puis `supabase/seed.sql`.
3. Authentication > Providers > Email : active l’e-mail (désactive « Confirm email » si tu veux tester sans confirmation).
4. Settings > API : copie l’URL, la clé `anon` et la clé `service_role`.

## 2. Variables d’environnement
Copie `.env.example` en `.env.local` et remplis les 3 valeurs. La clé `service_role` est secrète : serveur uniquement.

## 3. Lancer en local
```
npm install
npm run dev
```
Ouvre http://localhost:3000, inscris-toi, puis dans Supabase SQL Editor :
```
update public.profiles set role = 'admin' where id = '<ton UUID dans Authentication > Users>';
```
Ajoute ton e-mail dans la variable `ADMIN_EMAILS`. Reconnecte-toi, va sur `/acces-admin` : scanne le QR code (2FA) puis valide le code. L’espace `/admin` n’est accessible qu’ensuite.

## 4. Premiers réglages (Admin > Réglages)
`whatsapp_number` (ex. 2376XXXXXXXX), `mtn_momo_number`, `orange_money_number`. Ajuste les prix dans Admin > Services.

## 5. Déployer sur Vercel
1. Pousse le dossier sur GitHub, puis « Import Project » sur vercel.com.
2. Ajoute les 3 variables d’environnement (Settings > Environment Variables).
3. Déploie. Dans Supabase > Authentication > URL Configuration, ajoute l’URL Vercel.

## Flux de paiement
Le client commande, paie par MTN/Orange/transfert et saisit l’ID de transaction. L’admin vérifie la réception réelle, puis confirme dans Admin > Paiements ; la commande passe alors en « Acceptée ». Rien n’est marqué payé automatiquement.

## Passerelle automatique (plus tard)
`payments.method = 'gateway'` et `gateway_ref` sont prévus : ajoute une route webhook qui vérifie la signature du prestataire puis met le paiement à « paid ».

## Sécurité
Prix recalculé côté serveur · rôle admin vérifié côté serveur à chaque requête · RLS sur toutes les tables · soldes modifiés uniquement par fonction SQL atomique · aucun mot de passe de réseau social demandé.

## Sécurité de l’espace admin (5 verrous)
1. E-mail présent dans `ADMIN_EMAILS` (échec fermé si la variable est absente).
2. Rôle `admin` en base (non modifiable par un utilisateur).
3. Session validée par code 2FA (TOTP, niveau aal2) — pages ET API.
4. Pour tout autre visiteur, `/admin` et `/api/admin` répondent **404** (la zone n’existe pas), `noindex`, `no-store`.
5. Anti-CSRF (contrôle de l’origine), limitation de débit, CSP stricte, HSTS, anti-iframe.

À régler côté plateformes :
- **Supabase** : Authentication > MFA : activer TOTP · longueur minimale du mot de passe 12 · protection contre les mots de passe compromis · durée du JWT 3600 s.
- **Vercel** : Firewall > activer les règles de limitation de débit sur `/api/*` et `/connexion`, et « Bot Protection ».
- Ne jamais committer `.env.local`. Change les clés Supabase si elles ont été exposées.
- **Mot de passe admin** : phrase de passe longue et unique (12+ caractères), jamais partagée ni écrite dans le code ou une conversation.
