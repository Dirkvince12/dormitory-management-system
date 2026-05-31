-- Rename room category enum values (boys/girls → male/female)

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
