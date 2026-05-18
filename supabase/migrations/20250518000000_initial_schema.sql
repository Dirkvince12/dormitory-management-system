-- Dormitory Management System — initial schema
-- Run in Supabase Dashboard → SQL Editor, or: supabase db push (with Supabase CLI)

create extension if not exists "pgcrypto";

create type public.room_status as enum ('available', 'full', 'partial');
create type public.payment_status as enum ('paid', 'pending', 'overdue');

-- Rooms (created before students for FK)
create table public.rooms (
  id bigint generated always as identity primary key,
  room_number text not null,
  floor integer not null check (floor >= 0),
  capacity integer not null check (capacity > 0),
  current_occupancy integer not null default 0 check (current_occupancy >= 0),
  status public.room_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_room_number_unique unique (room_number)
);

create table public.students (
  id bigint generated always as identity primary key,
  name text not null,
  student_id text not null,
  course text not null,
  department text not null,
  contact_number text not null,
  assigned_room_id bigint references public.rooms (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_student_id_unique unique (student_id)
);

create table public.assignments (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.students (id) on delete cascade,
  room_id bigint not null references public.rooms (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint assignments_student_id_unique unique (student_id)
);

create table public.payments (
  id bigint generated always as identity primary key,
  student_id bigint not null references public.students (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  description text not null,
  due_date date not null,
  paid_date date,
  status public.payment_status not null default 'pending',
  period text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index students_assigned_room_id_idx on public.students (assigned_room_id);
create index assignments_room_id_idx on public.assignments (room_id);
create index payments_student_id_idx on public.payments (student_id);
create index payments_status_idx on public.payments (status);

-- Keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rooms_set_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.rooms enable row level security;
alter table public.students enable row level security;
alter table public.assignments enable row level security;
alter table public.payments enable row level security;

create policy "Authenticated users can read rooms"
  on public.rooms for select to authenticated using (true);

create policy "Authenticated users can insert rooms"
  on public.rooms for insert to authenticated with check (true);

create policy "Authenticated users can update rooms"
  on public.rooms for update to authenticated using (true);

create policy "Authenticated users can delete rooms"
  on public.rooms for delete to authenticated using (true);

create policy "Authenticated users can read students"
  on public.students for select to authenticated using (true);

create policy "Authenticated users can insert students"
  on public.students for insert to authenticated with check (true);

create policy "Authenticated users can update students"
  on public.students for update to authenticated using (true);

create policy "Authenticated users can delete students"
  on public.students for delete to authenticated using (true);

create policy "Authenticated users can read assignments"
  on public.assignments for select to authenticated using (true);

create policy "Authenticated users can insert assignments"
  on public.assignments for insert to authenticated with check (true);

create policy "Authenticated users can update assignments"
  on public.assignments for update to authenticated using (true);

create policy "Authenticated users can delete assignments"
  on public.assignments for delete to authenticated using (true);

create policy "Authenticated users can read payments"
  on public.payments for select to authenticated using (true);

create policy "Authenticated users can insert payments"
  on public.payments for insert to authenticated with check (true);

create policy "Authenticated users can update payments"
  on public.payments for update to authenticated using (true);

create policy "Authenticated users can delete payments"
  on public.payments for delete to authenticated using (true);
