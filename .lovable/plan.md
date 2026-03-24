

## Alterar cor de todos os botões para #FD46A1

A cor `#FD46A1` corresponde a HSL `337 98% 64%`. A abordagem mais eficiente é atualizar as variáveis centrais de cor primária, assim todos os botões (e elementos que usam `bg-primary`, `bg-primary-500`, etc.) mudam automaticamente.

### Alterações

**1. `src/index.css`** — Atualizar a variável CSS `--primary`
- Linha 16: `--primary: 336 100% 40%` → `--primary: 337 98% 64%`

**2. `tailwind.config.ts`** — Atualizar as cores primary no Tailwind
- `DEFAULT: '#CC0055'` → `DEFAULT: '#FD46A1'`
- `500: '#CC0055'` → `500: '#FD46A1'`
- `600: '#B3004B'` → `600: '#E53D8F'` (hover mais escuro)
- `700: '#99003F'` → `700: '#CC357D'`

Isso garante que todos os botões com `bg-primary`, `bg-primary-500`, `hover:bg-primary-600`, e o variant `default` do componente Button mudem automaticamente sem editar cada arquivo individual.

