# Scan de Conta com IA (Despesas)

Aproveitar o upload de imagem que já existe no `TransactionModal` para, ao anexar uma foto de cupom/conta de restaurante, chamar uma IA que extrai os dados e preenche o lançamento automaticamente.

## Fluxo do usuário

1. No modal de despesa, o usuário tira/escolhe a foto da conta (já existe).
2. Logo abaixo da miniatura aparece um botão **"Preencher com IA"** (rosa, ícone Sparkles).
3. Ao clicar: overlay de loading ("Lendo sua conta…"), a IA analisa e devolve:
   - `valor` (R$)
   - `descrição` (ex: "Restaurante X – Almoço")
   - `categoria` sugerida (mapeada para as categorias existentes de despesa)
   - `data` (se legível no cupom; senão mantém a atual)
4. Campos do formulário são preenchidos automaticamente. Usuário revisa e salva normalmente.
5. A imagem continua sendo salva como `receipt_url` (comportamento atual).

Se a IA falhar ou não conseguir ler, mostra toast amigável e mantém os campos como estavam.

## Backend

**Nova edge function `scan-receipt`** (`supabase/functions/scan-receipt/index.ts`):
- Input: `{ imageUrl: string }` (URL pública do bucket `finance-receipts`) ou `{ imageBase64 }`.
- Chama Lovable AI Gateway com modelo `google/gemini-3-flash-preview` (multimodal, barato e rápido), usando **tool calling** para devolver JSON estruturado:
  ```
  { amount: number, description: string, suggested_category: string,
    occurred_on: string|null, merchant: string|null, confidence: number }
  ```
- Prompt instrui a IA a interpretar cupons fiscais/contas de restaurante em PT-BR, somar total (incluindo taxa de serviço quando presente), e escolher uma categoria entre as opções enviadas no prompt.
- Trata 429 (rate limit) e 402 (créditos) devolvendo mensagens claras.
- `verify_jwt = true` (usuário autenticado).

## Frontend

**`TransactionModal.tsx`**:
- Botão "Preencher com IA" só aparece quando `kind === 'despesa'` E existe `previewUrl`/`receiptUrl`.
- Handler `handleAiScan`:
  1. Se a imagem ainda não foi enviada (`receiptFile` local), faz upload primeiro para obter URL pública.
  2. `supabase.functions.invoke('scan-receipt', { body: { imageUrl } })`.
  3. Preenche `amount`, `description`, `categoryId` (resolvendo nome → id da lista atual de categorias de despesa), e `date` se vier.
  4. Toast de sucesso com nome do estabelecimento (quando houver).
- Reusa o `VideoOverlay` existente para o loader.

## Não muda

- Schema do banco (continua usando `receipt_url`).
- RLS, bucket, lógica de salvar/editar despesa.
- Receitas (ficam sem upload e sem IA).

## Detalhes técnicos

- Modelo: `google/gemini-3-flash-preview` via `https://ai.gateway.lovable.dev/v1/chat/completions`.
- Sem dependências novas.
- Sem cobrança extra além do uso do Lovable AI Gateway (free tier cobre testes iniciais).
- Custo estimado por scan: muito baixo (imagem + ~200 tokens de saída).
