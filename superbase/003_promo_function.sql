-- Compteur d'usage des codes promo (appelé par l'API serveur /api/orders)
-- À exécuter une seule fois si tu avais déjà lancé schema.sql avant cet ajout.
create or replace function public.increment_promo_use(pid uuid) returns void
language sql security definer set search_path = public as $$
  update public.promo_codes set used_count = used_count + 1 where id = pid;
$$;
revoke all on function public.increment_promo_use(uuid) from public, anon, authenticated;
