insert into public.user_roles (user_id, role)
values ('9051a4db-edf7-45db-97f0-72f2021ee4b6', 'admin'::public.app_role)
on conflict (user_id, role) do nothing;