## Anexo de imagem (comprovante) em despesas

Permitir anexar 1 imagem opcional ao cadastrar/editar uma **despesa**. Receitas seguem sem anexo.

### Banco

Migração:
- `ALTER TABLE finance_transactions ADD COLUMN receipt_url text`
- Novo bucket público `finance-receipts` com RLS em `storage.objects`:
  - SELECT: público (bucket público para exibir direto via URL)
  - INSERT/UPDATE/DELETE: somente o dono (path `{auth.uid()}/...`)

### Tipos

Regenerar `types.ts` (automático). Adicionar `receipt_url?: string | null` em `FinanceTx` e `NewTxInput` (`useFinanceTransactions.ts`).

### UI — TransactionModal.tsx

Dentro do bloco, **somente quando `kind === 'despesa'`**, adicionar um campo "Comprovante (opcional)" acima da descrição:

- Área clicável (dropzone) `rounded-2xl border-2 border-dashed border-[#FD46A1]/40 bg-white/40` com ícone `ImagePlus`, label "Toque para adicionar foto" e hint "JPG/PNG até 5 MB".
- `<input type="file" accept="image/*" capture="environment" hidden>` — `capture` aciona câmera no mobile e também aceita galeria.
- Após selecionar: mostra preview (img 100% width, `aspect-video`, `object-cover`, rounded-2xl) com botão "X" rosa para remover (define `receipt_url=null` e remove arquivo do storage se já salvo).
- Estado local: `receiptFile: File | null`, `receiptUrl: string | null` (já salvo), `uploading: boolean`.
- No `handleSave`:
  1. Se há `receiptFile`: upload para `finance-receipts/{user.id}/{uuid}.{ext}` → pega `publicUrl` → seta em `receipt_url`.
  2. Se removeu (`receiptUrl` foi limpo e havia um anterior): remove do storage antes de salvar.
  3. Persiste a tx com `receipt_url`.

### UI — FinanceTimeline.tsx

Quando `tx.receipt_url` existir:
- Renderiza miniatura 40×40 `rounded-lg object-cover` à esquerda do conteúdo do card (entre o nó e o texto).
- Não há lightbox aqui — clique no card mantém comportamento atual (abre edição/navega).

### UI — FinancasDia.tsx

No modal aberto pelo `openEdit`, o componente já receberá `initial.receipt_url` via prop `initial`.

Quando deletar um lançamento que tinha `receipt_url`, remover também o arquivo do storage (em `useFinanceTransactions.remove`).

### Detalhes técnicos

- Limite 5 MB validado client-side antes do upload (toast de erro).
- Compressão opcional ignorada nesta versão; upload direto.
- Não usar edge functions — upload direto via `supabase.storage.from('finance-receipts').upload(...)`.
- Sem novas dependências.

### Arquivos alterados

- nova migração: bucket + coluna + policies
- `src/hooks/useFinanceTransactions.ts` — tipos + remoção de arquivo no `remove`
- `src/components/financas/TransactionModal.tsx` — bloco condicional de upload
- `src/components/financas/FinanceTimeline.tsx` — miniatura
