## Ajuste da faixa inferior do card Desafio 14 Dias

**Objetivo:** Tornar o overlay inferior do card "Desafio 14 Dias" (em `TertiaryDeckRow.tsx`) visualmente idêntico ao padrão usado no card de "Último treino" (em `HeroDeckRow.tsx`).

**Alterações:**
1. Substituir o `bg-gradient-to-t` atual por `bg-black/55 backdrop-blur-sm`.
2. Mudar o layout para `flex items-center justify-between gap-2` com padding `px-3 py-2.5`.
3. Adicionar o ícone `ChevronRight` à direita da faixa.
4. Ajustar a tipografia:
   - Label superior: `text-[10px] uppercase tracking-wide text-white/70`
   - Título: `text-base text-white truncate`
5. Adicionar o import de `ChevronRight` do `lucide-react`.

**Referência visual:** Card esquerdo de `HeroDeckRow.tsx` (linhas 61-71).