## Ajuste do padrão visual da página /loja

Problema: a página `/loja` está com header customizado (botão voltar + título "Loja" + subtítulo) e um card-título "Nossa Loja" logo abaixo. Isso foge do padrão das outras páginas internas do app (Receitas, Comunidade, etc.), que usam o componente global `<Navbar />` no topo. Como a `/loja` não renderiza essa Navbar, ela some na tela.

### Mudanças em `src/pages/Loja.tsx`

1. **Importar e renderizar `<Navbar />`** no topo do JSX (mesmo padrão de `Receitas.tsx`).
2. **Remover o header custom** (div com `ArrowLeft` + "Loja" + "Produtos selecionados pra você").
3. **Remover o card-título "Nossa Loja"** (#FFD1E7 com ícone `ShoppingBag`) — o título da página já vem da Navbar global.
4. **Ajustar o container** para deixar espaço para a Navbar fixa no topo: trocar `p-4 space-y-5` por `pt-[calc(env(safe-area-inset-top)+5rem)] px-4 pb-4 space-y-5` (mesmo offset usado em outras páginas internas).
5. **Limpar imports** não usados: `useNavigate`, `ArrowLeft`, `ShoppingBag`.

A estrutura final fica:

```text
<Navbar />                ← navbar global do app
<div container>
  Buscador + chips         ← agora primeiro elemento abaixo da navbar
  Carrosséis (ou grid)
</div>
```

### Fora do escopo
- Mexer em `/admin/loja` (admin pages mantêm o header com botão voltar, padrão atual).
- Alterar conteúdo dos carrosséis ou da busca.
