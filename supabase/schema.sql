-- ============================================================
-- Nauči AI — Supabase šema
-- Pokreni ovo u Supabase dashboard-u: SQL Editor -> New query -> Run
-- ============================================================

-- 1) Tabela kupovina. Popunjava je Polar webhook kad porudžbina bude plaćena.
--    Pristup kursu = postoji red ovde sa istim email-om kao ulogovani korisnik.
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  provider text not null default 'polar',
  external_id text,
  amount_cents integer,
  currency text,
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

-- Korisnik može da vidi SAMO svoj red (poredi se email iz JWT-a sa email kolonom).
-- Webhook upisuje preko service_role ključa, koji zaobilazi RLS, pa mu ova politika ne treba.
drop policy if exists "Korisnik vidi samo svoju kupovinu" on public.purchases;
create policy "Korisnik vidi samo svoju kupovinu"
  on public.purchases for select
  using (email = (auth.jwt() ->> 'email'));

-- 2) Tabela napretka kroz lekcije (koju lekciju je korisnik označio kao odrađenu).
create table if not exists public.lesson_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_slug text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_slug)
);

alter table public.lesson_progress enable row level security;

drop policy if exists "Korisnik upravlja svojim napretkom" on public.lesson_progress;
create policy "Korisnik upravlja svojim napretkom"
  on public.lesson_progress for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- Napomena o autentifikaciji (magic link):
-- U Supabase dashboard-u -> Authentication -> Providers -> Email,
-- ostavi uključeno "Enable Email provider", a "Confirm email" može
-- ostati uključeno jer magic link i jeste ta potvrda.
-- U Authentication -> URL Configuration dodaj:
--   Site URL:              https://tvoj-domen.rs  (ili http://localhost:3000 za razvoj)
--   Redirect URLs:         https://tvoj-domen.rs/auth/callback
--                          http://localhost:3000/auth/callback
-- ============================================================
