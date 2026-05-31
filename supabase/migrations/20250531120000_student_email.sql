-- Student email address

alter table public.students
  add column if not exists email text not null default '';
