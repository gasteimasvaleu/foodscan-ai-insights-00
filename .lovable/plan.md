## Plan: Nova linha de cards na home (abaixo de Loja/Balanço)

### Goal
Adicionar uma nova fileira de cards em `Index.tsx`, posicionada entre `SecondaryDeckRow` e `QuickActions`, com layout espelhado/invertido em relação à fileira de cima.

### Layout
```text
┌─────────────────────┬──────────┐
│ Desafio 14 Dias     │ Conquistas│
│ (imagem 16:9)       │ (imagem)  │
│ → /desafio-14-dias  │ → /conquistas│
└─────────────────────┴──────────┘
```

- **Esquerda (maior, ~1.6fr):** card com a imagem `image_1778753915971_2cb0be9a.png` (formato 16:9), navega para `/desafio-14-dias`.
- **Direita (menor, ~1fr):** card com a imagem `image_1778753342779_756d33ee.png`, navega para `/conquistas`.

### Implementation
1. **Create `src/components/TertiaryDeckRow.tsx`**
   - Grid `grid-cols-[1.6fr_1fr] gap-3 items-stretch` (invertido em relação ao `SecondaryDeckRow`).
   - Dois `<button>` com `rounded-3xl overflow-hidden shadow-lg`.
   - Card esquerdo: `aspect-[16/9]` com `object-cover`.
   - Card direito: `aspect-[4/5]` com `object-cover`.
   - Cada um com um pequeno overlay de texto na parte inferior (título da rota).

2. **Update `src/pages/Index.tsx`**
   - Importar `TertiaryDeckRow`.
   - Inserir `<TertiaryDeckRow />` entre `<SecondaryDeckRow />` e `<QuickActions />`.