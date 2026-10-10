-- K? (Kumusta Ka?) — Supabase schema, migration 001
-- Run via `supabase db push` or paste into the SQL editor.
-- Every table is private-by-default via Row Level Security (RLS):
-- a user can only ever see/modify rows where user_id = auth.uid().

create extension if not exists "pgcrypto";

-- ---------- Profiles & settings ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  timezone text default 'Asia/Manila',
  theme text default 'system',
  encouragement_mode text default 'private' check (encouragement_mode in ('personalized','private','off')),
  diary_ai_consent boolean default false,
  companion_name text default 'Kuya Shark',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Mood ----------
create table if not exists mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  occurred_at timestamptz not null default now(),
  mood smallint not null check (mood between 1 and 10),
  energy smallint check (energy between 1 and 10),
  stress smallint check (stress between 1 and 10),
  emotions text[] default '{}',
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_mood_user_date on mood_entries(user_id, entry_date);

-- ---------- Symptoms ----------
create table if not exists symptom_definitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- null = global default
  name text not null,
  category text not null check (category in ('emotional','cognitive','physical','behavioral','custom')),
  created_at timestamptz default now()
);

create table if not exists symptom_observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symptom_id uuid not null references symptom_definitions(id),
  entry_date date not null,
  occurred_at timestamptz not null default now(),
  severity smallint not null check (severity between 0 and 10),
  duration_minutes integer,
  note text,
  created_at timestamptz default now()
);
create index if not exists idx_symptom_obs_user_date on symptom_observations(user_id, entry_date);

-- ---------- Sleep ----------
create table if not exists sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null, -- the day the user woke up
  bedtime timestamptz not null,
  wake_time timestamptz not null,
  quality smallint check (quality between 1 and 10),
  minutes_to_fall_asleep integer,
  awakenings integer,
  nap boolean default false,
  note text,
  created_at timestamptz default now()
);
create index if not exists idx_sleep_user_date on sleep_entries(user_id, entry_date);

-- ---------- Medications ----------
create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dosage text,
  instructions text,
  start_date date not null,
  end_date date,
  schedule_times text[] not null default '{}',
  created_at timestamptz default now()
);

create table if not exists dose_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null references medications(id) on delete cascade,
  entry_date date not null,
  scheduled_time text not null,
  status text not null default 'unrecorded' check (status in ('taken','skipped','unrecorded')),
  recorded_at timestamptz,
  note text,
  unique (medication_id, entry_date, scheduled_time)
);
create index if not exists idx_dose_user_date on dose_records(user_id, entry_date);

-- ---------- Diary ----------
create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  title text,
  body text not null default '',
  tags text[] default '{}',
  mood_id uuid references mood_entries(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_diary_user_date on diary_entries(user_id, entry_date);

-- ---------- Daily encouragement ----------
create table if not exists encouragement_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  message_type text not null check (message_type in ('original','quote')),
  text text not null,
  source text,
  diary_entry_id uuid references diary_entries(id),
  favorited boolean default false,
  feedback text check (feedback in ('helpful','not_relevant') or feedback is null),
  created_at timestamptz default now(),
  unique (user_id, entry_date)
);

-- ---------- Companion ----------
create table if not exists companion_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text default 'Kuya Shark',
  appearance jsonb default '{}',
  interaction_style text default 'gentle',
  milestones jsonb default '[]',
  updated_at timestamptz default now()
);

-- ---------- Insights ----------
create table if not exists insight_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  headline text not null,
  explanation text not null,
  date_range_start date,
  date_range_end date,
  observation_count integer,
  evidence jsonb default '{}',
  limitations text,
  created_at timestamptz default now()
);

-- ---------- Experiments ----------
create table if not exists personal_experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  variable text,
  start_date date not null,
  end_date date,
  baseline_start date,
  baseline_end date,
  notes text,
  created_at timestamptz default now()
);

-- ---------- Reminders ----------
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('mood','symptoms','sleep','medications','diary','reflection')),
  time text not null, -- "HH:MM"
  days_of_week smallint[] default '{0,1,2,3,4,5,6}',
  enabled boolean default true,
  timezone text default 'Asia/Manila'
);

-- ---------- Reports ----------
create table if not exists report_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preset text not null check (preset in ('brief','detailed','custom')),
  date_range_start date not null,
  date_range_end date not null,
  options jsonb default '{}',
  generated_at timestamptz default now()
);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table profiles enable row level security;
alter table mood_entries enable row level security;
alter table symptom_definitions enable row level security;
alter table symptom_observations enable row level security;
alter table sleep_entries enable row level security;
alter table medications enable row level security;
alter table dose_records enable row level security;
alter table diary_entries enable row level security;
alter table encouragement_messages enable row level security;
alter table companion_state enable row level security;
alter table insight_results enable row level security;
alter table personal_experiments enable row level security;
alter table reminders enable row level security;
alter table report_history enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own symptom defs" on symptom_definitions for all
  using (user_id is null or auth.uid() = user_id) with check (auth.uid() = user_id);

-- Generic "owner only" policy, repeated per table (Postgres has no
-- cross-table policy templates, so each table gets its own).
create policy "own rows" on mood_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on symptom_observations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on sleep_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on medications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on dose_records for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on diary_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on encouragement_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on companion_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on insight_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on personal_experiments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on report_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed global default symptoms (visible to everyone, user_id null)
insert into symptom_definitions (user_id, name, category) values
  (null, 'Anxiety', 'emotional'),
  (null, 'Low mood', 'emotional'),
  (null, 'Irritability', 'emotional'),
  (null, 'Racing thoughts', 'cognitive'),
  (null, 'Trouble concentrating', 'cognitive'),
  (null, 'Fatigue', 'physical'),
  (null, 'Headache', 'physical'),
  (null, 'Appetite change', 'physical'),
  (null, 'Social withdrawal', 'behavioral')
on conflict do nothing;
