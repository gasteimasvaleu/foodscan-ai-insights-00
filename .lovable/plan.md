## Objetivo

Padronizar a UI da página `/maternidade`:
1. Todos os botões com `rounded-xl` (cards seguem `rounded-3xl`, modais/inputs/dialogs `rounded-2xl`/`rounded-xl` como já estão).
2. Todos os `CardTitle` dentro de `src/components/maternidade/**` e `src/pages/Maternidade.tsx` em negrito (`font-semibold`), mantendo `text-base`. Exceção apenas dentro da Maternidade — sem alterar a regra global.

## Escopo

Varredura em:
- `src/pages/Maternidade.tsx`
- `src/components/maternidade/**/*.tsx`

## Alterações

### 1. Border radius dos botões
Procurar todos os `<Button ...>` (e `<button>` quando for ação tipo botão de fato — não chips/badges/pills decorativos com `rounded-full`) e normalizar para `rounded-xl`. Casos identificados a corrigir:
- `BabyGenerator.tsx`: ícone de remover imagem usa `rounded-full` (manter — é ícone circular). Demais botões já estão `rounded-xl`.
- `BabyNames.tsx`: `TabsTrigger` com `rounded-lg` → `rounded-xl`.
- Qualquer `<Button>` sem classe de radius explícito ou com `rounded-lg`/`rounded-md`/`rounded-2xl`/`rounded-full` (exceto os intencionalmente circulares como close X, ícones avatar, chips tipo tag) → trocar para `rounded-xl`.

Não mexer em:
- Cards (`rounded-3xl`), modais (`rounded-2xl`), DrawerContent, badges/chips com `rounded-full`, barras de progresso (`rounded-t-md`/`rounded-full`), avatares circulares.

### 2. Títulos dos cards em negrito
Em todos os arquivos de `src/components/maternidade/**` e `src/pages/Maternidade.tsx`:
- Adicionar `font-semibold` aos `CardTitle` que ainda não têm peso definido (a maioria está `text-base` apenas).
- Manter `text-base` e cores existentes.

## Detalhes técnicos

- Usar `rg` para listar todos os `<Button` e `CardTitle` afetados, depois aplicar edits com `code--line_replace` arquivo por arquivo.
- Não alterar a memória global de tipografia (a regra "card titles normal weight" continua valendo fora da Maternidade).

## Fora do escopo

- Lógica funcional dos componentes.
- Outras páginas do app.
- Cards, modais, badges e elementos circulares por design.
