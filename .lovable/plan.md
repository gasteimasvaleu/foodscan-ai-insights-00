

## Padronizar modal de receitas e melhorar loading

### Mudancas em `src/components/RecipeDetails.tsx`

**1. Estilizar DialogContent no padrao do app**
- Adicionar classes: `w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`
- Manter `max-h-[85vh] overflow-y-auto p-0`

**2. Substituir loading de Skeletons por spinner centralizado**
- Remover os Skeletons atuais
- Mostrar um spinner animado (`animate-spin rounded-full border-b-2 border-primary`) centralizado
- Texto abaixo: "Traduzindo receita..." com animacao de pulso (`animate-pulse`)
- Centralizado vertical e horizontalmente dentro do modal com altura minima

