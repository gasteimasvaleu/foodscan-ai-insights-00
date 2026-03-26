

## Plano: Ajustar cores do MultipleElementsPortionSelector

### Alterações no arquivo `src/components/MultipleElementsPortionSelector.tsx`:

1. **Background do card principal** (linha 68): `bg-amber-50` → `bg-[#F9FAFB]`, `border-amber-200` → `border-white/20`
2. **Textos do header** (linhas 71, 74): cores amber → `text-gray-800` e `text-gray-600`
3. **Cards internos** (linha 82): `border-amber-100` → `border-gray-200`
4. **Ícone e nome** (linhas 84-85): `text-amber-600` / `text-amber-800` → `text-gray-600` / `text-gray-800`
5. **SelectTrigger** (linha 95): `border-amber-200 focus:border-amber-400` → `border-gray-800 focus:border-gray-900`
6. **Texto "ou"** (linha 108): `text-amber-600` → `text-gray-800`
7. **Input de gramas** (linha 120): `border-amber-200 focus:border-amber-400` → `border-gray-800 focus:border-gray-900`
8. **Span "g"** (linha 123): `text-amber-600` → `text-gray-800`

Isso alinha o estilo com o `PortionSelector` de elemento único que já usa `#F9FAFB` e `border-gray-800`.

