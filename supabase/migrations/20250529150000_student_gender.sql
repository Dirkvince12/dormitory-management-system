-- Student gender (Male / Female)

alter table public.students
  add column if not exists gender public.room_category;
