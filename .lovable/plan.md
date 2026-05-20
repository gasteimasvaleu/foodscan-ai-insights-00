## Diagnóstico

Existe 1 entregador cadastrado, aprovado e disponível:

- `caio` — cidade salva como **"joao pessoa"** (sem acento), estado PB, status `aprovado`, `disponivel = true`.

No `MFEntregadoresDisponiveis.tsx` a busca é feita com:

```ts
.ilike("cidade", cidade.trim())
```

O `ilike` é case-insensitive, mas **não ignora acentos**. Quando o cliente digita "João Pessoa" no carrinho, o Postgres compara `"joao pessoa"` com `"João Pessoa"` e não encontra match — por isso o entregador não aparece.

O mesmo problema atinge o painel do entregador (`useMFEntregas` com `scope: "entregador-disponivel"`) e qualquer outra busca por cidade.

## Plano

### 1. Migração — função RPC que ignora acentos

Criar `public.mf_entregadores_disponiveis(_cidade text)` usando a extensão `unaccent` (já instalada no projeto):

```sql
create or replace function public.mf_entregadores_disponiveis(_cidade text)
returns setof public.mf_entregadores
language sql stable security definer set search_path = public
as $$
  select *
  from public.mf_entregadores
  where status = 'aprovado'
    and disponivel = true
    and lower(unaccent(cidade)) = lower(unaccent(coalesce(_cidade,'')))
  order by avaliacao_media desc
  limit 10;
$$;
```

(`grant execute` para `anon, authenticated`.)

Não altero dados existentes — apenas a forma de buscar.

### 2. Frontend — `src/components/mercado-facil/MFEntregadoresDisponiveis.tsx`

Trocar o `.from("mf_entregadores").select(...).ilike("cidade", ...)` por:

```ts
supabase.rpc("mf_entregadores_disponiveis", { _cidade: cidade.trim() })
```

Mantém o resto da UI igual.

### 3. (Opcional, recomendado) Normalizar cidade ao cadastrar

No `EntregadorCadastro.tsx`, ao salvar, capitalizar apenas para exibição mas manter compatível. Como o RPC já resolve, esta etapa é opcional — confirmo se quer incluir.

## Fora do escopo

- Não mexo no painel do entregador / `useMFEntregas` agora (mesma raiz, mas é outro fluxo). Posso aplicar a mesma normalização lá num passo seguinte se quiser.
- Sem alterações em RLS, esquema das tabelas ou em dados existentes.
