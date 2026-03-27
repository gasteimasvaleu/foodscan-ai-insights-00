

## Corrigir zoom automático do iOS em campos de texto

### Problema
O iOS Safari faz zoom automático em qualquer `<textarea>` ou `<input>` com fonte menor que 16px, deslocando o viewport e quebrando layouts fixos (modais, chat do NutriCoach).

### Correção

**1. `src/components/ui/textarea.tsx`**
- Trocar `text-sm` por `text-base md:text-sm` na classe base

**2. `src/components/ui/input.tsx`**
- Trocar `text-base ... md:text-sm` — já usa `text-base` e `md:text-sm`, então verificar se está correto (pode já estar ok)

**3. `src/pages/NutriCoach.tsx`**
- O `<textarea>` inline do chat usa `text-sm` direto — trocar por `text-base md:text-sm`

