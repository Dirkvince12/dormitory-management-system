-- Room photos (public URL from Supabase Storage bucket `room-images`)

alter table public.rooms
  add column if not exists image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'room-images',
  'room-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read room images"
  on storage.objects for select
  using (bucket_id = 'room-images');

create policy "Authenticated upload room images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'room-images');

create policy "Authenticated update room images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'room-images');

create policy "Authenticated delete room images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'room-images');
