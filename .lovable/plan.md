# Banco de alimentos colaborativo

Cada nova refeição registrada vira sugestão. Quando ≥ 3 usuários distintos registram o mesmo item normalizado, ela é promovida automaticamente ao `food_catalog` com origem "comunidade", marcada com badge na página `/alimentos`. Itens oficiais continuam intocados.

## 1. Schema novo

**Tabela `food_catalog_suggestions`** (staging)
- `name_normalized` (text, único) — lowercase, sem acento, sem números/quantidades
- `display_name` (text) — versão exibível mais frequente
- `category` (text) default `preparacoes`
- `calories_per_100g`, `proteins_per_100g`, `carbs_per_100g`, `fats_per_100g` (numeric) — média ponderada
- `submissions_count` (int)
- `distinct_users_count` (int)
- `status` (text: `pending` | `approved` | `rejected`) default `pending`
- `promoted_food_id` (uuid, nullable)
- `last_seen_at`, `created_at`, `updated_at`

**Tabela `food_catalog_suggestion_submissions`**
- (suggestion_id, user_id) único — base do contador distinto.

**Coluna nova em `food_catalog`**
- `source` (text: `official` | `community`) default `official`
- `community_suggestion_id` (uuid, nullable)

## 2. Lógica de ingestão

Trigger `AFTER INSERT` em `meal_records` chama `public.ingest_meal_to_catalog()` (SECURITY DEFINER), que:

1. Normaliza `food_name` (lowercase + unaccent + remove dígitos e palavras de quantidade: g, ml, prato, fatia, colher, unidade, etc.). Função auxiliar `normalize_food_name(text)`.
2. Estima gramas da porção via regex no campo `portion`. Sem estimativa confiável → aborta silenciosamente.
3. Calcula macros por 100g. Outliers (kcal/100g > 900 ou < 0) → aborta.
4. Filtra contra `chat_banned_words` e exige nome de 3 a 60 chars.
5. `INSERT ... ON CONFLICT (name_normalized) DO UPDATE`:
   - Atualiza médias móveis ponderadas
   - Incrementa `submissions_count`
   - Insere em `food_catalog_suggestion_submissions` se par novo → recalcula `distinct_users_count`
6. Se `distinct_users_count >= 3` e `status = 'pending'`:
   - Insere em `food_catalog` com `source='community'`
   - Marca sugestão como `approved` + grava `promoted_food_id`

Erros capturados em BEGIN/EXCEPTION para nunca quebrar o INSERT da refeição.

## 3. UI

**`/alimentos`** — badge "Comunidade" (chip rosa claro) ao lado do nome quando `source='community'`. Toggle "Mostrar itens da comunidade" (default ligado).

**`/admin/alimentos-comunidade`** (gated por `has_role admin`):
- Lista sugestões `pending` ordenadas por `distinct_users_count desc`
- Mostra nome normalizado, contagens, macros médias
- Ações: Aprovar agora / Rejeitar / Editar nome+categoria / Mesclar com item existente (busca por similarity via pg_trgm)
- Lista também itens já promovidos com botão "Despromover"

## 4. Privacidade e segurança

- Não copia `food_name` original — só `name_normalized` + `display_name` agregado.
- Filtro de palavrões cruzando `chat_banned_words`.
- RLS em `food_catalog_suggestions`: SELECT só admin; escrita só via função SECURITY DEFINER.

## 5. Threshold

`_PROMOTION_THRESHOLD = 3` como constante no início da função — fácil de ajustar.

## 6. Fora de escopo

- Sem backfill das 19 refeições históricas.
- Sem mesclagem fuzzy automática com catálogo oficial — só sugestão no painel admin.

## Detalhes técnicos

- Migration única: tabelas + função normalize + função ingest + trigger + RLS + coluna `source` em food_catalog.
- `useFoodCatalog`: adicionar `source` ao tipo e select.
- `Alimentos.tsx`: badge condicional + filtro.
- Nova página `src/pages/admin/AlimentosComunidade.tsx` reutilizando padrão de `/admin/loja`.
- Rota nova em `src/App.tsx`.

## Arquivos a criar/editar

- Migration SQL
- `src/hooks/useFoodCatalog.ts`
- `src/pages/Alimentos.tsx`
- `src/pages/admin/AlimentosComunidade.tsx` (novo)
- `src/App.tsx`
