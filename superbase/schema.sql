-- OMA-BOOSTER — Schéma Supabase (PostgreSQL) — Conception : OMA TOKITA
-- À exécuter dans Supabase > SQL Editor. Montants en FCFA (entiers).

create extension if not exists pgcrypto;

-- ========== PROFILS ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user','admin')),
  balance integer not null default 0 check (balance >= 0),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ========== SERVICES ==========
create table public.services (
  id uuid primary key default gen_random_uuid(),
  network text not null check (network in ('facebook','instagram','tiktok','youtube','x','threads','telegram','whatsapp')),
  category text not null,
  name text not null,
  description text,
  price_per_1000 integer not null check (price_per_1000 >= 0),
  min_qty integer not null default 100 check (min_qty > 0),
  max_qty integer not null default 10000,
  eta text,
  link_hint text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check (max_qty >= min_qty)
);
create index on public.services (network, is_active);

-- ========== CODES PROMO ==========
create table public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  percent_off integer check (percent_off between 1 and 100),
  amount_off integer check (amount_off > 0),
  max_uses integer,
  used_count integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  check (percent_off is not null or amount_off is not null)
);

-- ========== COMMANDES ==========
create sequence public.order_seq start 1000;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null default ('OB-' || nextval('public.order_seq')),
  user_id uuid not null references public.profiles(id),
  service_id uuid not null references public.services(id),
  link text not null,
  quantity integer not null check (quantity > 0),
  unit_price_per_1000 integer not null,   -- prix figé au moment de la commande
  discount integer not null default 0,
  total integer not null check (total >= 0),
  promo_code_id uuid references public.promo_codes(id),
  status text not null default 'pending'
    check (status in ('pending','accepted','processing','completed','cancelled','refused')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.orders (user_id, created_at desc);
create index on public.orders (status);

-- ========== PAIEMENTS ==========
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id),
  user_id uuid not null references public.profiles(id),
  method text not null check (method in ('mtn_momo','orange_money','manual_transfer','gateway')),
  amount integer not null check (amount > 0),
  payer_phone text,
  reference text,                         -- ID de transaction saisi par le client
  gateway_ref text,                       -- réservé à une future passerelle automatique
  status text not null default 'pending' check (status in ('pending','paid','rejected')),
  confirmed_by uuid references public.profiles(id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.payments (user_id, created_at desc);

-- ========== SUPPORT ==========
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  order_id uuid references public.orders(id),
  subject text not null,
  status text not null default 'open' check (status in ('open','answered','closed')),
  created_at timestamptz not null default now()
);
create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  is_admin boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text, phone text, message text not null,
  created_at timestamptz not null default now()
);

-- ========== CONTENU ==========
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author text not null, content text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.site_settings (
  key text primary key, value text not null
);
insert into public.site_settings (key, value) values
  ('site_name','OMA-BOOSTER'),('slogan','Ta visibilité, notre priorité.'),
  ('whatsapp_number',''),('mtn_momo_number',''),('orange_money_number',''),('credit','OMA TOKITA');

-- ========== SÉCURITÉ (RLS) ==========
-- Les écritures sensibles (commande, paiement, solde, promo) passent UNIQUEMENT
-- par les routes API serveur avec la clé service_role. Aucun insert client.
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.promo_codes enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.contact_messages enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;

create policy "profil: lecture soi/admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profil: maj soi" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;  -- ni role ni balance

create policy "services: public actifs" on public.services for select using (is_active or public.is_admin());
create policy "services: admin écriture" on public.services for all using (public.is_admin()) with check (public.is_admin());

create policy "promo: admin" on public.promo_codes for all using (public.is_admin()) with check (public.is_admin());

create policy "commandes: lecture soi/admin" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "commandes: admin maj" on public.orders for update using (public.is_admin());

create policy "paiements: lecture soi/admin" on public.payments for select using (user_id = auth.uid() or public.is_admin());
create policy "paiements: admin maj" on public.payments for update using (public.is_admin());

create policy "tickets: soi/admin" on public.tickets for select using (user_id = auth.uid() or public.is_admin());
create policy "tickets: création soi" on public.tickets for insert with check (user_id = auth.uid());
create policy "tickets: admin maj" on public.tickets for update using (public.is_admin());

create policy "messages: lecture" on public.ticket_messages for select using (
  public.is_admin() or exists (select 1 from public.tickets t where t.id = ticket_id and t.user_id = auth.uid()));
create policy "messages: envoi" on public.ticket_messages for insert with check (
  author_id = auth.uid() and is_admin = public.is_admin() and (
    public.is_admin() or exists (select 1 from public.tickets t where t.id = ticket_id and t.user_id = auth.uid())));

create policy "contact: admin lecture" on public.contact_messages for select using (public.is_admin());
create policy "témoignages: publics" on public.testimonials for select using (is_published or public.is_admin());
create policy "témoignages: admin" on public.testimonials for all using (public.is_admin()) with check (public.is_admin());
create policy "réglages: lecture publique" on public.site_settings for select using (true);
create policy "réglages: admin" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- Pour créer ton compte admin : inscris-toi sur le site, puis exécute :
-- update public.profiles set role = 'admin' where id = '<TON_UUID_AUTH>';

-- Compteur d'usage des codes promo (appelé par l'API serveur)
create or replace function public.increment_promo_use(pid uuid) returns void
language sql security definer set search_path = public as $$
  update public.promo_codes set used_count = used_count + 1 where id = pid;
$$;
revoke all on function public.increment_promo_use(uuid) from public, anon, authenticated;
