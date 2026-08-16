create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table meds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,              -- user's own label, e.g. "oq tabletka"
  dose_text text,                  -- free text the user typed, e.g. "1 tabletka"
  times time[] not null,           -- ['08:00','20:00']
  active boolean not null default true,
  created_at timestamptz default now()
);

create table med_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  med_id uuid not null references meds on delete cascade,
  scheduled_for timestamptz not null,
  status text not null check (status in ('taken','skipped')),
  logged_at timestamptz default now(),
  unique (med_id, scheduled_for)
);

alter table profiles  enable row level security;
alter table meds      enable row level security;
alter table med_logs  enable row level security;

create policy "own profile"  on profiles  for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy "own meds"     on meds      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own logs"     on med_logs  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
