-- Create a lightweight `health_check` table if it doesn't exist. This table
-- is used by the frontend/backend to perform a simple existence check.
create table if not exists public.health_check (
  id serial primary key,
  created_at timestamptz default now()
);

-- Ensure there is at least one row in the health_check table so simple selects
-- in the app aren't empty.
insert into public.health_check (created_at)
select now()
where not exists (select 1 from public.health_check limit 1);

-- Robust schema health check function. Returns true if all required tables
-- exist in the public schema. This function uses a single return boolean and
-- is safe to call repeatedly.
create or replace function public.check_schema_health()
returns boolean as $$
declare
  required_tables text[] := array['users','trips','bookings','vehicles','referral_codes','referrals','referral_rewards','ratings','health_check'];
  t text;
begin
  foreach t in array required_tables loop
    if not exists (
      select 1
      from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      return false;
    end if;
  end loop;

  -- Optional: check for at least one RLS policy on `users` if RLS is expected
  -- (skip failure if pg_policies view is not available).
  begin
    if exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'users'
    ) then
      -- policy exists; continue
      null;
    end if;
  exception when undefined_table then
    -- pg_policies may not exist in some environments; ignore the check
    null;
  end;

  return true;
end;
$$ language plpgsql security definer;