

## Reduzir padding interno do card FoodScan

O card do FoodScan tem padding duplo: `p-4` no wrapper externo (FoodScan.tsx linha 678) + `p-6` no div interno do ImageUpload (linha 74). Isso cria um espaçamento maior que os outros cards.

### Alteracao

**`src/components/ImageUpload.tsx`** (linha 74):
- Trocar `p-6` por `p-2` no div wrapper principal, alinhando com o padding dos outros cards do app

