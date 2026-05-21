## Objetivo

Substituir o card simples "Sua loja" no `LojistaDashboard` por um header visual no estilo da imagem de referência (card do perfil), reutilizando os campos já existentes em `mf_lojas` (`banner_url`, `foto_url`, `nome`, `telefone_whatsapp`).

## Mudanças (apenas `src/pages/mercado-facil/LojistaDashboard.tsx`)

Substituir o bloco atual (linhas 59–66 + grid 68–77) por um único card branco com `rounded-3xl overflow-hidden shadow-sm`:

```
┌─────────────────────────────────────┐
│  [banner rosa/imagem]      [📷]     │  ← cover h-28, gradient #FD46A1 se sem banner_url
│   ◯ avatar                          │  ← foto_url ou inicial do nome, -mt-10, border-4 white
│   (sobreposto ao banner)            │
│                          [✏ Editar] │  ← link p/ /mercado-facil/lojista/loja, outline rosa pill
│  Nome da Loja                       │  ← text-2xl font-bold
│  WhatsApp: 5583...                  │  ← text-sm text-foreground/60
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │ 📦   │ │ 🧾   │ │ 🏪   │         │  ← 3 mini-cards bg-[#FFD1E7] rounded-2xl
│  │  12  │ │  34  │ │ Ativa│         │
│  │PROD. │ │PEDID.│ │STATUS│         │
│  └──────┘ └──────┘ └──────┘         │
└─────────────────────────────────────┘
```

### Detalhes técnicos

- **Banner**: `div` h-28 usando `loja.banner_url` via `background-image` ou fallback `bg-gradient-to-r from-[#FD46A1] to-[#FF7AB8]`. Ícone câmera (Camera) opcional no canto sup. dir. apenas decorativo (sem upload novo — link p/ página de edição).
- **Avatar**: `w-20 h-20 rounded-full border-4 border-white -mt-10 ml-4` com `loja.foto_url` ou inicial.
- **Botão Editar**: pill outline `border-[#FD46A1] text-[#FD46A1]` posicionado à direita, alinhado com avatar, linkando p/ `/mercado-facil/lojista/loja`. Ícone `Pencil`.
- **Nome + WhatsApp**: abaixo do avatar (px-4).
- **Stats grid**: 3 colunas (`grid-cols-3 gap-2 px-4 pb-4`) usando os 3 mini-cards rosa:
  - Produtos (`produtosCount`) — ícone `Package`
  - Pedidos (`pedidosCount`) — ícone `ListOrdered`
  - Status (`loja.ativa ? "Ativa" : "Inativa"`) — ícone `Store`
- Remover a `grid grid-cols-2` separada de Produtos/Pedidos (linhas 68–77), pois passa a viver dentro do header.
- Manter intactos os dois links de "Gerenciar produtos" e "Pedidos recebidos" abaixo.

### Imports a adicionar

`Camera`, `Pencil` de `lucide-react` (já temos `Package`, `Store`, `ListOrdered`).

### Fora de escopo

- Upload de banner/avatar (botão da câmera é apenas visual e leva à página de edição).
- Mudanças em `LojistaLoja.tsx` ou no schema do DB.
- Tema dark/light tokens — manter as cores fixas atuais (`#FD46A1`, `#FFD1E7`) para consistência com o resto do Mercado Fácil.
