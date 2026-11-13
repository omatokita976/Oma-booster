-- À exécuter APRÈS schema.sql : bannissement, crédits, journal admin, boost gratuit.
alter table public.profiles
  add column banned_until timestamptz,
  add column banned_permanent boolean not null default false,
  add column ban_reason text;
alter table public.orders add column is_free boolean not null default false;

alter table public.payments drop constraint payments_method_check;
alter table public.payments add constraint payments_method_check
  check (method in ('mtn_momo','orange_money','manual_transfer','gateway','balance'));

create table public.balance_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  delta integer not null, reason text, actor_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action text not null, target_user uuid, details jsonb,
  created_at timestamptz not null default now()
);
alter table public.balance_ledger enable row level security;
alter table public.admin_logs enable row level security;
create policy "ledger: soi/admin" on public.balance_ledger for select using (user_id = auth.uid() or public.is_admin());
create policy "logs: admin" on public.admin_logs for select using (public.is_admin());

-- Modification atomique du solde (refuse un solde négatif)
create or replace function public.adjust_balance(uid uuid, delta integer, reason text, actor uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare nb integer;
begin
  update public.profiles set balance = balance + delta where id = uid and balance + delta >= 0 returning balance into nb;
  if nb is null then raise exception 'insufficient_balance'; end if;
  insert into public.balance_ledger (user_id, delta, reason, actor_id) values (uid, delta, reason, actor);
  return nb;
end $$;
revoke all on function public.adjust_balance(uuid, integer, text, uuid) from public, anon, authenticated;
