## Ajustes na TubelightNavbar

Três mudanças pequenas e independentes:

### 1. Remover Treinos da barra inferior

Em `src/App.tsx`, tirar a linha `{ name: 'Treinos', url: '/treinos', icon: Dumbbell }` do array `navItems` (linha 103) e remover `Dumbbell` do import da linha 13 (não é mais usado lá).

A barra fica com 6 itens: Home, FoodScan, Controle, FitTracker, MasterChef, Mais — mais espaço pro botão **+** voltar a aparecer confortavelmente.

Treinos **já existe** no Sheet do Menu Mais (seção Premium, com ícone Dumbbell) — não precisa adicionar, só não duplicar.

### 2. Cor da TubelightNavbar igual à top Navbar

Hoje a top Navbar usa: `bg-[#FA1690]/85 backdrop-blur-md border-b border-white/20`.

A tubelight tinha sido alterada para `bg-[#FA1690]/40 backdrop-blur-2xl` (parte do experimento Liquid Glass). Voltar para a mesma fórmula da top:

- `bg-[#FA1690]/85`
- `backdrop-blur-md`
- `border border-white/20`

Em `src/components/ui/tubelight-navbar.tsx`, no container interno da pill (atual `bg-[#FA1690]/40 border-white/30 backdrop-blur-2xl`).

### 3. Manter o efeito Liquid Glass só no que cabe com fundo opaco

Com o fundo voltando a `/85` (quase opaco), a camada de **refração SVG** (`feDisplacementMap`) perde sentido — não dá pra ver refração através de um vidro fosco. Vou **remover** a camada `filter: url(#liquid-glass)` e o `<LiquidGlassFilter />` da navbar (e o import correspondente). O arquivo `src/components/ui/liquid-glass-filter.tsx` fica para uso futuro em outros lugares (ex.: dock de Quick Actions desktop).

O que **fica mantido** do experimento, porque combina bem com a cor sólida:
- Highlight especular branco no topo (sheen `linear-gradient`).
- `box-shadow` inset branco nas bordas (borda de vidro).
- Sombra externa dupla pra "flutuar".
- `active:scale-110` nos itens com easing spring.
- Curva spring 220/22 do indicador "lamp".

### Arquivos

- **Editar** `src/App.tsx` — remover item Treinos do `navItems` e ajustar import de `lucide-react` (tirar `Dumbbell`).
- **Editar** `src/components/ui/tubelight-navbar.tsx`:
  - Voltar bg/blur/border para os valores da top Navbar.
  - Remover renderização condicional do `<LiquidGlassFilter />` e da camada de refração.
  - Remover imports `useNativePlatform` e `LiquidGlassFilter` (não mais usados).
  - Manter highlight, shadow inset e animações de toque.

### Fora de escopo

- Não mexer no Sheet do Menu Mais (Treinos já está lá).
- Não tocar na top `Navbar` nem no `MFHeader`.
- Não apagar `liquid-glass-filter.tsx` (pode reusar em outro lugar).
