-- Lift Calc initial schema: roles, profiles, lifts, workout history,
-- custom exercises, personal records, reported issues.

-- =========================================================================
-- Roles (never store roles on profiles — dedicated table + security definer fn)
-- =========================================================================
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- Profiles
-- =========================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text check (char_length(first_name) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile (and default 'user' role) when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name');

  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================================================================
-- Shared validation trigger: reject future dates
-- =========================================================================
create or replace function public.reject_future_date()
returns trigger
language plpgsql
as $$
begin
  if new.performed_at is not null and new.performed_at > current_date then
    raise exception 'Date cannot be in the future';
  end if;
  return new;
end;
$$;

create or replace function public.reject_future_achieved_date()
returns trigger
language plpgsql
as $$
begin
  if new.achieved_at is not null and new.achieved_at > current_date then
    raise exception 'Date cannot be in the future';
  end if;
  return new;
end;
$$;

-- =========================================================================
-- Lifts (current working weight/reps per exercise per user, for calculator)
-- =========================================================================
create table public.lifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text not null check (char_length(exercise) between 1 and 100),
  weight numeric(7,2) not null check (weight >= 0 and weight <= 10000),
  reps integer not null check (reps >= 0 and reps <= 1000),
  updated_at timestamptz not null default now(),
  unique (user_id, exercise)
);

alter table public.lifts enable row level security;

create policy "Users can manage their own lifts"
  on public.lifts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_lifts_updated_at
  before update on public.lifts
  for each row execute function public.set_updated_at();

-- =========================================================================
-- Workout history
-- =========================================================================
create table public.workout_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text not null check (char_length(exercise) between 1 and 100),
  weight numeric(7,2) not null check (weight >= 0 and weight <= 10000),
  reps integer not null check (reps >= 0 and reps <= 1000),
  performed_at date not null default current_date,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);

alter table public.workout_history enable row level security;

create policy "Users can manage their own workout history"
  on public.workout_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger workout_history_reject_future_date
  before insert or update on public.workout_history
  for each row execute function public.reject_future_date();

create index workout_history_user_exercise_idx
  on public.workout_history (user_id, exercise, performed_at desc);

-- =========================================================================
-- Custom exercises
-- =========================================================================
create table public.custom_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.custom_exercises enable row level security;

create policy "Users can manage their own custom exercises"
  on public.custom_exercises for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================================================================
-- Personal records
-- =========================================================================
create table public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text not null check (char_length(exercise) between 1 and 100),
  weight numeric(7,2) not null check (weight >= 0 and weight <= 10000),
  reps integer not null check (reps >= 0 and reps <= 1000),
  achieved_at date not null default current_date,
  manual_override boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, exercise)
);

alter table public.personal_records enable row level security;

create policy "Users can manage their own personal records"
  on public.personal_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger personal_records_reject_future_date
  before insert or update on public.personal_records
  for each row execute function public.reject_future_achieved_date();

create trigger set_personal_records_updated_at
  before update on public.personal_records
  for each row execute function public.set_updated_at();

-- Estimated 1RM (Epley) used to auto-detect PRs
create or replace function public.estimated_one_rm(_weight numeric, _reps integer)
returns numeric
language sql
immutable
as $$
  select _weight * (1 + _reps::numeric / 30)
$$;

-- Auto-update personal_records when a new workout beats the current PR,
-- unless the current PR was set manually.
create or replace function public.check_personal_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.personal_records%rowtype;
begin
  select * into existing
  from public.personal_records
  where user_id = new.user_id and exercise = new.exercise;

  if existing is null then
    insert into public.personal_records (user_id, exercise, weight, reps, achieved_at, manual_override)
    values (new.user_id, new.exercise, new.weight, new.reps, new.performed_at, false);
  elsif not existing.manual_override
    and public.estimated_one_rm(new.weight, new.reps) > public.estimated_one_rm(existing.weight, existing.reps) then
    update public.personal_records
    set weight = new.weight,
        reps = new.reps,
        achieved_at = new.performed_at
    where id = existing.id;
  end if;

  return new;
end;
$$;

create trigger workout_history_check_pr
  after insert on public.workout_history
  for each row execute function public.check_personal_record();

-- =========================================================================
-- Reported issues
-- =========================================================================
create table public.reported_issues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  description text check (description is null or char_length(description) <= 2000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reported_issues enable row level security;

create policy "Users can view their own reported issues"
  on public.reported_issues for select
  using (auth.uid() = user_id);

create policy "Users can create reported issues"
  on public.reported_issues for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all reported issues"
  on public.reported_issues for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update reported issues"
  on public.reported_issues for update
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger set_reported_issues_updated_at
  before update on public.reported_issues
  for each row execute function public.set_updated_at();
