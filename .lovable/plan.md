## Padronizar header da Lista de Compras

O header atual da página `/lista-de-compras` usa um estilo próprio (faixa rosa clara `#FFD1E7`) que não bate com o padrão usado em outras páginas internas do app (Objetivos, etc.), e está sem o ícone identificador.

### Padrão a seguir (mesmo de `Objetivos`)

```text
[ícone em caixinha gradiente]  Título grande em rosa
```

- Container: `bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3`
- Caixinha do ícone: `bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg`
- Ícone: `ShoppingCart` (lucide), branco, 24px
- Título: `text-lg font-bold text-primary` → "Lista de Compras"
- Remover o subtítulo "Organize suas compras por categoria" (não usado em outras páginas)

### Mudanças

**`src/pages/ShoppingList.tsx`**
- Trocar import `ArrowLeft` por `ShoppingCart`
- Substituir o bloco do header pelo padrão acima
- Ajustar wrapper para `bg-background` (token) em vez de `bg-[#F7FAFB]` hardcoded

Sem alterações em rotas, hooks, banco ou outros componentes.