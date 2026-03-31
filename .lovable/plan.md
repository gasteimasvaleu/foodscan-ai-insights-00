
Objetivo: conceder status de admin ao usuário `admin@wediet.app` adicionando registro em `public.user_roles`.

Contexto validado:
- Usuário existe em `auth.users` com `id = 9051a4db-edf7-45db-97f0-72f2021ee4b6`.
- Atualmente não há registro desse usuário em `public.user_roles`.

Plano de execução:
1. Inserir papel `admin` em `public.user_roles` para esse `user_id`.
2. Evitar duplicidade com verificação prévia (ou `ON CONFLICT DO NOTHING` se houver constraint adequada).
3. Validar resultado consultando `user_roles` + `has_role(...)`.
4. Confirmar no app acessando `/admin` com esse usuário.

SQL a executar no Supabase SQL Editor:
```sql
-- 1) conferir antes
select id, email
from auth.users
where email = 'admin@wediet.app';

select *
from public.user_roles
where user_id = '9051a4db-edf7-45db-97f0-72f2021ee4b6';

-- 2) inserir role admin
insert into public.user_roles (user_id, role)
values ('9051a4db-edf7-45db-97f0-72f2021ee4b6', 'admin');

-- 3) validar
select user_id, role, created_at
from public.user_roles
where user_id = '9051a4db-edf7-45db-97f0-72f2021ee4b6';

select public.has_role('9051a4db-edf7-45db-97f0-72f2021ee4b6', 'admin');
```

Detalhes técnicos:
- O `AdminDashboard` já valida admin por `supabase.rpc('has_role', { _user_id, _role: 'admin' })`.
- Após inserir em `user_roles`, o acesso administrativo passa a funcionar sem alteração de código.
