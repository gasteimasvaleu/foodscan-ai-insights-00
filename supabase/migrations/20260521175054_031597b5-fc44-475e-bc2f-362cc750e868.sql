
insert into storage.buckets (id, name, public)
values ('musicas-capas', 'musicas-capas', true)
on conflict (id) do nothing;

create policy "Musicas capas publicly readable"
on storage.objects for select
using (bucket_id = 'musicas-capas');

create policy "Admins can upload musicas capas"
on storage.objects for insert
to authenticated
with check (bucket_id = 'musicas-capas' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update musicas capas"
on storage.objects for update
to authenticated
using (bucket_id = 'musicas-capas' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete musicas capas"
on storage.objects for delete
to authenticated
using (bucket_id = 'musicas-capas' and public.has_role(auth.uid(), 'admin'));
