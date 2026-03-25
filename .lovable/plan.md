

## Plan: Standardize "Ações Rápidas" card to match pink theme

### Changes in `src/pages/Profile.tsx` (lines 450-491)

1. **Outer Card** (line 450): Change `bg-card/80 backdrop-blur-sm border-border/50` to `bg-[#FFD1E7] rounded-3xl border border-white/20` (matching Estatísticas Gerais)

2. **CardTitle** (line 452): Remove emoji, center text, increase size to match — change to `text-center text-2xl font-semibold`

3. **CardDescription** (line 453): Center it with `text-center`

4. **Inner buttons** (lines 457-489): Change `variant="outline"` buttons to styled divs with `bg-[#F9FAFB] rounded-2xl` background, and update icon colors from `text-primary` to `text-pink-500`

