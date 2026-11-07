-- Fixes from code review:
-- 1) Personal records were only recomputed on INSERT into workout_history,
--    going stale after an edit or delete. Recompute from the full history
--    instead of comparing against a single cached row, and do it on
--    insert/update/delete.
-- 2) has_role() was callable by anon via PostgREST RPC (SECURITY DEFINER
--    with no REVOKE), letting anyone enumerate admins. Lock it to
--    `authenticated` only (RLS policies that call it run as that role).
-- 3) The "no future dates" triggers compared a client-local date against
--    the database's UTC current_date, rejecting legitimate same-day
--    entries for users east of UTC. Allow a one-day grace window, which
--    covers every real timezone offset while still rejecting genuinely
--    future dates.

-- =========================================================================
-- 1) Recompute personal_records from actual workout_history instead of
--    only comparing a new row against the single cached PR row.
-- =========================================================================
create or replace function public.recompute_personal_record(p_user_id uuid, p_exercise text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  existing public.personal_records%rowtype;
  best record;
begin
  select * into existing
  from public.personal_records
  where user_id = p_user_id and exercise = p_exercise;

  -- Manual overrides are a deliberate user choice; never auto-overwrite them.
  if existing.manual_override then
    return;
  end if;

  select w.weight, w.reps, w.performed_at
  into best
  from public.workout_history w
  where w.user_id = p_user_id and w.exercise = p_exercise
  order by public.estimated_one_rm(w.weight, w.reps) desc, w.performed_at desc
  limit 1;

  if best is null then
    -- No workouts left for this exercise; drop the stale auto-detected PR.
    delete from public.personal_records
    where user_id = p_user_id and exercise = p_exercise and not manual_override;
    return;
  end if;

  insert into public.personal_records (user_id, exercise, weight, reps, achieved_at, manual_override)
  values (p_user_id, p_exercise, best.weight, best.reps, best.performed_at, false)
  on conflict (user_id, exercise) do update
  set weight = excluded.weight,
      reps = excluded.reps,
      achieved_at = excluded.achieved_at
  where not public.personal_records.manual_override;
end;
$$;

create or replace function public.check_personal_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recompute_personal_record(old.user_id, old.exercise);
    return old;
  end if;

  perform public.recompute_personal_record(new.user_id, new.exercise);

  if tg_op = 'UPDATE' and new.exercise is distinct from old.exercise then
    perform public.recompute_personal_record(old.user_id, old.exercise);
  end if;

  return new;
end;
$$;

drop trigger if exists workout_history_check_pr on public.workout_history;

create trigger workout_history_check_pr
  after insert or update or delete on public.workout_history
  for each row execute function public.check_personal_record();

-- =========================================================================
-- 2) Lock down has_role(): authenticated only, never anon/public.
-- =========================================================================
revoke execute on function public.has_role(uuid, public.app_role) from public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- =========================================================================
-- 3) Allow a one-day grace window on "no future dates" so a legitimate
--    same-day entry isn't rejected just because the database's UTC date
--    hasn't rolled over yet for a user east of UTC.
-- =========================================================================
create or replace function public.reject_future_date()
returns trigger
language plpgsql
as $$
begin
  if new.performed_at is not null and new.performed_at > current_date + 1 then
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
  if new.achieved_at is not null and new.achieved_at > current_date + 1 then
    raise exception 'Date cannot be in the future';
  end if;
  return new;
end;
$$;
