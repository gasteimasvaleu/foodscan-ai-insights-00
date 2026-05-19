## Objetivo

O usuário `admin@wediet.app` já tem a role `admin` e as policies de `venues`, `venue_memberships`, `venue_messages`, `venue_presence`, `venue_bans` e `venue_interactions` já permitem acesso total para admin (SELECT/UPDATE/DELETE com `has_role(auth.uid(), 'admin')`).

A única restrição que ainda bloqueia o admin é a trigger `venues_enforce_owner_limit`, que limita qualquer dono a no máximo 3 venues. Vou isentá-la para admins.

## Mudança

Atualizar a função `public.venues_enforce_owner_limit()` para pular a checagem quando `public.has_role(NEW.owner_id, 'admin')` retornar true.

```sql
CREATE OR REPLACE FUNCTION public.venues_enforce_owner_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _count int;
BEGIN
  -- Admin não tem limite
  IF public.has_role(NEW.owner_id, 'admin') THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO _count FROM public.venues WHERE owner_id = NEW.owner_id;
  IF _count >= 3 THEN
    RAISE EXCEPTION 'venue_limit_reached: cada usuário pode cadastrar no máximo 3 venues';
  END IF;
  RETURN NEW;
END;
$$;
```

## O que não muda

- Demais usuários continuam limitados a 3 venues.
- Policies já cobrem SELECT/UPDATE/DELETE de tudo para admin — nada a mexer.
- Frontend (`/admin/to-aqui`, criação de venue) já funciona; nenhum código React precisa de alteração.

## Resultado

Após a migração, o admin poderá cadastrar quantos venues quiser e continua com acesso total a venues, mensagens, presenças, interações e bans via as RLS atuais.