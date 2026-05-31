  -- Safe to re-run. Paste into Supabase Dashboard → SQL Editor → Run.
  -- Brings an existing database up to date with the latest app schema.

  -- Room bed configuration and amenities
  do $$ begin
    create type public.room_bed_type as enum (
      'single_bed',
      'two_beds',
      'single_double_deck',
      'two_double_deck'
    );
  exception
    when duplicate_object then null;
  end $$;

  alter table public.rooms
    add column if not exists bed_type public.room_bed_type,
    add column if not exists amenities jsonb not null default '{}'::jsonb;

  -- Room category (Male / Female)
  do $$ begin
    create type public.room_category as enum ('male', 'female');
  exception
    when duplicate_object then null;
  end $$;

  alter table public.rooms
    add column if not exists category public.room_category;

  -- Rename legacy enum labels if present
  do $$
  begin
    if exists (
      select 1
      from pg_enum e
      join pg_type t on e.enumtypid = t.oid
      where t.typname = 'room_category' and e.enumlabel = 'boys'
    ) then
      alter type public.room_category rename value 'boys' to 'male';
    end if;

    if exists (
      select 1
      from pg_enum e
      join pg_type t on e.enumtypid = t.oid
      where t.typname = 'room_category' and e.enumlabel = 'girls'
    ) then
      alter type public.room_category rename value 'girls' to 'female';
    end if;
  end $$;

  -- Student gender
  alter table public.students
    add column if not exists gender public.room_category;

  -- Student email
  alter table public.students
    add column if not exists email text not null default '';

  -- Refresh PostgREST schema cache so the API sees new columns immediately
  notify pgrst, 'reload schema';
