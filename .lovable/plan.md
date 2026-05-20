Esse layout que você mandou é exatamente o `ProfileHeaderCard` que já existe em `src/components/profile/ProfileHeaderCard.tsx` (usado em `/perfil`). Vou reaproveitar ele no carrinho — zero código duplicado, mesmo visual.

## O que vou fazer

### 1. `src/pages/mercado-facil/Carrinho.tsx`
- Importar `ProfileHeaderCard` e `useSubscription`.
- Estender o `useEffect` que já busca o profile para também trazer todos os campos que o card precisa (`avatar_url`, `cover_url`, `bio`, `email_public`, `phone`, `address`, `city`, `state`, `created_at`) — hoje só busca `name` e `telefone_whatsapp`.
- Guardar o profile completo em um único state `profile` (em vez dos dois states atuais), mantendo `profileName`/`profilePhone` derivados dele para não quebrar o resto da página.
- Renderizar `<ProfileHeaderCard ... />` logo abaixo do `<MFClientePedidosStatus />` e **acima do bloco de "Entrega"**, dentro do `<main>`.
- Aparece tanto quando o carrinho está cheio quanto vazio (igual o card de status que acabamos de fazer).
- Se o usuário não estiver logado, o card simplesmente não renderiza.

### 2. Sem novos componentes, sem mudanças de schema
- `ProfileHeaderCard` já cuida de upload de avatar/cover, edição via `EditProfileDialog`, exibição de streak / conquistas / membro desde, e badge de Pro.
- O callback `onProfileUpdate` atualiza o state local pra refletir mudanças imediatamente.

## Layout final da página

```text
┌────────────────────────────┐
│ Ver status do pedido (n) ▾ │  ← já existe
├────────────────────────────┤
│ [Profile Header Card]      │  ← novo (reaproveitado)
│  capa rosa + avatar + nome │
│  Editar · Sequência/Conq…  │
├────────────────────────────┤
│ Entrega (cidade/endereço)  │
├────────────────────────────┤
│ Lojas + itens + WhatsApp   │
└────────────────────────────┘
```

## Fora de escopo

- Não mexer no `ProfileHeaderCard` em si — visual fica idêntico ao de `/perfil`.
- Não duplicar fetch de subscription: usar o hook `useSubscription` que já existe.

## Detalhes técnicos

- O profile vem da tabela `profiles` (mesma query, mais colunas no `select`).
- `useSubscription()` fornece `subscribed` para o prop `isPro`.
- O card tem `mb-8` por padrão — vou envolver num wrapper sem margem extra pra manter o `space-y-4` do `<main>`.
