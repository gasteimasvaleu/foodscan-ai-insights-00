

## Adicionar Jejum Intermitente no menu "+" e corrigir erro runtime

### Problema atual
O `Timer` icon foi removido do import em `QuickActions.tsx` mas ainda está referenciado em algum lugar, causando `ReferenceError: Timer is not defined`. Preciso verificar se há resquício do item de jejum no array de actions.

### Alterações

1. **`src/components/QuickActions.tsx`** — Verificar e remover qualquer referência residual a `Timer` que está causando o erro runtime.

2. **`src/components/ui/tubelight-navbar.tsx`** — Adicionar "Jejum Intermitente" ao array `moreSheetItems` com ícone `Timer` do lucide-react, descrição e URL `/jejum`, seguindo o mesmo padrão visual dos outros itens.

