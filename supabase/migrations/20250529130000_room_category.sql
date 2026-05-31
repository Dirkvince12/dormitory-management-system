-- Room category (Male / Female)

create type public.room_category as enum ('male', 'female');

alter table public.rooms
  add column if not exists category public.room_category;
