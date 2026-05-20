## Objetivo
Padronizar o card "hero" das páginas de categoria (`MFCategoryHero`) com o estilo dos demais headers do app.

## Mudanças

### `src/components/mercado-facil/MFCategoryHero.tsx`
1. **Ícone à esquerda, quadrado**: trocar a ordem dos filhos para o emoji vir antes do texto e mudar `rounded-full` → `rounded-2xl` (mantendo `w-14 h-14`, `bg-white/60 backdrop-blur-md`).
2. **Título na cor do app**: `text-base text-foreground` → `text-base font-semibold text-[#FD46A1]` (mesma cor usada nos outros headers/títulos do Mercado Fácil).
3. Subtítulo continua `text-xs text-foreground/70`.
4. Manter `rounded-3xl bg-[#FFD1E7] p-4 mb-3 flex items-center gap-3`.

## Fora de escopo
- Sem mudança de copy, de dados (`getCategoryCopy`), ou de comportamento.
- Sem alteração no `Categoria.tsx` ou em outros cards do app.