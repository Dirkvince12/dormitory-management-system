-- Room bed configuration and amenities

create type public.room_bed_type as enum (
  'single_bed',
  'two_beds',
  'single_double_deck',
  'two_double_deck'
);

alter table public.rooms
  add column if not exists bed_type public.room_bed_type,
  add column if not exists amenities jsonb not null default '{}'::jsonb;
