
## Provador: histórico de looks + limite de 3 imagens/dia

Custo confirmado do `google/gemini-3.1-flash-image-preview`: ~US$ 0,04 por imagem. Com limite de **3/dia por usuário**, teto de ~US$ 0,12/usuário/dia.

> Observação técnica: o backend não tem primitivas próprias de rate limiting, então a checagem será ad-hoc — contagem direta na tabela do histórico dentro da edge function. Funciona bem para esse volume.

### 1. Banco (migration)

Nova tabela `provador_generations`:
- `id uuid pk`
- `user_id uuid not null`
- `result_url text not null`
- `user_image_url text` (referência da pessoa)
- `outfit_image_url text` (referência da roupa)
- `created_at timestamptz default now()`
- Índice em `(user_id, created_at desc)`

RLS: SELECT/INSERT/DELETE somente quando `auth.uid() = user_id`. Sem UPDATE.

### 2. Edge function `virtual-tryon` (limite 3/dia)

Antes de chamar a IA:
1. Contar `provador_generations` do `userId` onde `created_at >= início do dia (UTC)`.
2. Se ≥ 3 → HTTP `429` com `{ error, limitReached: true, used: 3, limit: 3 }`.
3. Admin (`9051a4db-edf7-45db-97f0-72f2021ee4b6`) é isento.

Após upload bem-sucedido no bucket:
4. Inserir registro em `provador_generations`.
5. Resposta inclui `usedToday` e `dailyLimit: 3`.

### 3. Frontend

**`src/hooks/useProvadorHistory.ts`** (novo): `history`, `usedToday`, `dailyLimit: 3`, `remaining`, `loading`, `refresh()`, `deleteItem(id)` (deleta linha + arquivo do bucket).

**`src/pages/Provador.tsx`**:
- Contador discreto acima do botão: "Hoje: X de 3 gerações".
- Em `429` com `limitReached`, toast amigável + botão desabilitado.
- Após gerar, `refresh()` para atualizar contador e galeria.
- Nova seção "Meus looks" abaixo, com `LookHistoryGrid`.

**`src/components/provador/LookHistoryGrid.tsx`** (novo):
- Grid 3 colunas, thumbnails 1:1 `rounded-xl`.
- Empty state: "Seus looks gerados aparecerão aqui."
- Clique abre Dialog (glassmorphism padrão) com imagem grande + **Baixar** e **Excluir**.

### 4. Memória

Atualizar `mem://features/provador/core`: histórico em `provador_generations`, limite **3 gerações/dia** por usuário (admin isento), checagem ad-hoc.

### Detalhe importante
Excluir um item **não** libera nova geração no mesmo dia — o limite é por contagem histórica do dia, não por itens vivos (evita abuso "gerar/deletar/repetir").

### Fora do escopo
- Limite mensal.
- Paywall ou plano premium com mais gerações.
- Compartilhamento na comunidade.
- Regerar look com variação.

### Arquivos
- **Novos**: migration SQL, `src/hooks/useProvadorHistory.ts`, `src/components/provador/LookHistoryGrid.tsx`.
- **Editados**: `supabase/functions/virtual-tryon/index.ts`, `src/pages/Provador.tsx`, `mem://features/provador/core`.
