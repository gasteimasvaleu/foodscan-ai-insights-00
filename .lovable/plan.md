## Objetivo

Refatorar o header da página `/to-aqui/venue/:id` para seguir o mesmo padrão visual do card de perfil do print (banner com gradiente rosa, avatar circular branco sobreposto à esquerda, ação à direita, nome/endereço abaixo, mini-cards de stats).

## Mudanças em `src/pages/ToAquiVenue.tsx`

Substituir o bloco atual (foto 16:9 + título + linha de meta + endereço + descrição soltos) por **um único card branco arredondado** com a seguinte estrutura:

```text
┌────────────────────────────────────┐
│  [Banner rosa gradiente / foto]    │
│                       [📷 categoria]│ ← chip flutuante topo-direita
│  ╭─────╮                            │
│  │ AV  │            [💬 Entrar]    │ ← avatar overlap + CTA à direita
│  ╰─────╯                            │
│  Nome do bar                        │
│  📍 endereço / cidade               │
│                                     │
│  [🔥 online] [👥 membros] [📅 desde]│ ← 3 mini-cards #FFD1E7
└────────────────────────────────────┘
```

### Detalhes
- Card externo: `bg-white rounded-3xl shadow-sm overflow-hidden`.
- Banner: altura `h-32`, `bg-gradient-to-br from-[#FD46A1] to-[#FFD1E7]`. Se `venue.photo_url`, usar como `<img>` cobrindo; senão gradiente puro.
- Chip de categoria flutuante no topo-direita do banner (`absolute top-3 right-3`), pílula branca translúcida com emoji + label.
- Avatar: círculo `w-24 h-24 rounded-full bg-[#FFD1E7] border-4 border-white -mt-12 ml-4`, mostrando emoji da categoria centralizado (ou inicial do nome).
- Linha avatar: `flex justify-between items-end px-4`, com botão "Entrar no chat" pill `#FD46A1` à direita (substitui o card de CTA inferior atual).
- Abaixo do avatar: `<h1>` nome `text-2xl font-bold`, e linha `text-sm text-gray-500` com `MapPin` + endereço/cidade.
- 3 mini-cards `bg-[#FFD1E7] rounded-2xl p-3 text-center` na base do card com:
  1. Chat ao vivo (ícone `MessageCircle`, label "CHAT")
  2. Cidade (ícone `MapPin`, label "LOCAL")
  3. Categoria (emoji, label "TIPO")

Manter abaixo do card os blocos existentes de **descrição** e **regras** como cards separados (sem mudar conteúdo).

Remover o card de CTA inferior (já está no header agora).

## Sem outras mudanças
- Hook `useVenue`, rotas, dados e demais páginas permanecem iguais.
