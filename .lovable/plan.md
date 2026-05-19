## Objetivo

1. Cada usuário Pro pode ter no máximo **3 venues** cadastrados (bar, festa ou restaurante — contagem total, independente do tipo).
2. Usuário pode **remover** venues que ele mesmo cadastrou.

## Backend

### Migration: limite no insert via trigger

Criar trigger `BEFORE INSERT` em `public.venues` que conta `owner_id = NEW.owner_id` e levanta exceção se já houver 3 ou mais. Conta inclui qualquer status (pending/approved/rejected) — se rejeitado também pesar, evita reuso. Mensagem clara ("limite_venues: máximo de 3 venues por usuário Pro").

```sql
CREATE OR REPLACE FUNCTION public.venues_enforce_owner_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _count int;
BEGIN
  SELECT count(*) INTO _count FROM public.venues WHERE owner_id = NEW.owner_id;
  IF _count >= 3 THEN
    RAISE EXCEPTION 'venue_limit_reached: cada usuário pode cadastrar no máximo 3 venues';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER venues_enforce_owner_limit_trg
BEFORE INSERT ON public.venues
FOR EACH ROW EXECUTE FUNCTION public.venues_enforce_owner_limit();
```

Observação: o limite vale para todo usuário cadastrando — controle de "Pro" continua sendo feito no frontend antes de abrir o formulário (gating Pro já existe no app). Como hoje não há outra forma de criar venue, o limite cobre o caso.

A RLS de delete `venues owner delete` já existe (linha 136 da migration original).

## Frontend

### 1. `src/pages/ToAquiOwner.tsx`
- Mostrar contador no topo: `{venues.length}/3 venues cadastrados`.
- Desabilitar o botão "Cadastrar novo venue" quando `venues.length >= 3`, trocando texto para "Limite de 3 venues atingido".

### 2. `src/pages/ToAquiNewVenue.tsx`
- Antes do submit, fazer um `select count` em `venues` do `owner_id = user.id`; se ≥ 3, exibir toast "Você já tem 3 venues — remova um antes de cadastrar outro." e abortar.
- Tratar erro `venue_limit_reached` retornado pelo backend com toast amigável (caso a checagem do frontend falhe).

### 3. `src/pages/ToAquiEditVenue.tsx`
- Adicionar botão "Excluir venue" no rodapé do formulário (visível só se `isOwner`).
- Estilo: `variant="outline"`, cor vermelha (`text-red-600 border-red-200`), ícone `Trash2`.
- Ao clicar, abrir `AlertDialog` de confirmação: "Tem certeza que deseja excluir este venue? Esta ação não pode ser desfeita. Todas as mensagens, presenças e interações serão apagadas."
- Confirmar → `supabase.from("venues").delete().eq("id", id)` → invalidar queries `["venues", "mine", user.id]` e `["venues", "approved"]` → navegar para `/to-aqui/owner`.
- O `ON DELETE CASCADE` em `venue_memberships`, `venue_messages`, `venue_presence`, `venue_bans`, `venue_reports`, `venue_interactions` já cuida das dependências.

## Fora do escopo

- Não alterar RLS de venues (a política owner delete já existe).
- Não mexer em quem é "Pro" — gating já é externo.
- Sem mudanças em `useVenues.ts` (já busca `venues` por owner).
