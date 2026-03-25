

## Reduzir espaçamento excessivo nas safe areas

### Problema
Pelo screenshot, há duas áreas com espaço excessivo:
1. **Topo (Navbar)**: A navbar tem `h-16` (64px) + safe area, ficando grande demais
2. **Inferior (TubelightNavbar)**: Usa `pb-[calc(14px+env(safe-area-inset-bottom))]` — os 14px extras somados ao safe area inset criam uma faixa branca grande demais. A faixa decorativa branca (`-bottom-4`) também contribui.

### Solução

**1. Navbar.tsx** — Reduzir altura interna:
- `h-16` (64px) → `h-12` (48px)
- Logo `h-10` → `h-8`

**2. TubelightNavbar.tsx** — Reduzir padding inferior:
- Trocar `pb-[calc(14px+env(safe-area-inset-bottom))]` por `pb-[env(safe-area-inset-bottom)]` (remover os 14px extras)
- Reduzir faixa decorativa branca: `-bottom-4` → `-bottom-2`

**3. Páginas** — Ajustar padding-top para acompanhar a navbar menor:
- Páginas com `+4rem` → `+3rem`
- Páginas com `+5rem` → `+4rem`

Arquivos afetados:
- `src/components/Navbar.tsx`
- `src/components/ui/tubelight-navbar.tsx`
- ~15 páginas em `src/pages/`

