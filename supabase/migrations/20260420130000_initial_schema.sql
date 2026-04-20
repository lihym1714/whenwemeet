create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  timezone text not null,
  start_date date not null,
  end_date date not null,
  day_start_minutes integer not null check (day_start_minutes >= 0 and day_start_minutes < 1440),
  day_end_minutes integer not null check (day_end_minutes > 0 and day_end_minutes <= 1440),
  slot_minutes integer not null check (slot_minutes in (15, 30, 60)),
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  display_name text not null,
  color_token text not null,
  session_token_hash text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists participants_event_session_idx
  on public.participants (event_id, session_token_hash);

create table if not exists public.availability_entries (
  participant_id uuid primary key references public.participants(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  slot_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create index if not exists availability_entries_event_idx
  on public.availability_entries (event_id);

alter table public.events enable row level security;
alter table public.participants enable row level security;
alter table public.availability_entries enable row level security;

drop policy if exists "deny direct event access" on public.events;
create policy "deny direct event access"
  on public.events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "deny direct participant access" on public.participants;
create policy "deny direct participant access"
  on public.participants
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "deny direct availability access" on public.availability_entries;
create policy "deny direct availability access"
  on public.availability_entries
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
