

## Reduzir safe area superior e restaurar logo

### Problema
O `pt-[env(safe-area-inset-top)]` aplica o inset completo do iPhone (~47px no notch), que somado à altura da navbar fica excessivo. A logo foi reduzida de `h-10` para `h-8` e ficou deformada.

### Solução

**1. Navbar.tsx** — Reduzir o padding da safe area pela metade e restaurar logo:
- Trocar `pt-[env(safe-area-inset-top)]` por `pt-[calc(env(safe-area-inset-top)*0.5)]` (metade do inset)
- Restaurar logo de `h-8` para `h-10`

**2. Páginas (~15 arquivos)** — Reduzir o offset correspondente:
- Trocar `+3rem` por `+2.5rem` nas páginas padrão
- Trocar `+4rem` por `+3.5rem` nas páginas de perfil

Isso reduz ~20-24px do espaço superior sem comprometer a visibilidade abaixo da status bar.

