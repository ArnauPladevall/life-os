create extension if not exists pgcrypto;

create table if not exists public.vault_security (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pin_hash text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.vault_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  login text not null,
  password_encrypted text not null,
  url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vault_entries_user_id_idx
  on public.vault_entries(user_id);

create index if not exists vault_entries_user_id_name_idx
  on public.vault_entries(user_id, name);

alter table public.vault_security enable row level security;
alter table public.vault_entries enable row level security;

drop policy if exists "vault_security_select_own" on public.vault_security;
drop policy if exists "vault_security_insert_own" on public.vault_security;
drop policy if exists "vault_security_update_own" on public.vault_security;
drop policy if exists "vault_security_delete_own" on public.vault_security;

create policy "vault_security_select_own"
  on public.vault_security
  for select
  using (auth.uid() = user_id);

create policy "vault_security_insert_own"
  on public.vault_security
  for insert
  with check (auth.uid() = user_id);

create policy "vault_security_update_own"
  on public.vault_security
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "vault_security_delete_own"
  on public.vault_security
  for delete
  using (auth.uid() = user_id);

drop policy if exists "vault_entries_select_own" on public.vault_entries;
drop policy if exists "vault_entries_insert_own" on public.vault_entries;
drop policy if exists "vault_entries_update_own" on public.vault_entries;
drop policy if exists "vault_entries_delete_own" on public.vault_entries;

create policy "vault_entries_select_own"
  on public.vault_entries
  for select
  using (auth.uid() = user_id);

create policy "vault_entries_insert_own"
  on public.vault_entries
  for insert
  with check (auth.uid() = user_id);

create policy "vault_entries_update_own"
  on public.vault_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "vault_entries_delete_own"
  on public.vault_entries
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vault_security_set_updated_at on public.vault_security;
create trigger vault_security_set_updated_at
before update on public.vault_security
for each row
execute function public.set_updated_at();

drop trigger if exists vault_entries_set_updated_at on public.vault_entries;
create trigger vault_entries_set_updated_at
before update on public.vault_entries
for each row
execute function public.set_updated_at();