## Objetivo
Substituir o pequeno header "Comunidade" por um card moderno no estilo do `ProfileHeaderCard` (cover + avatar sobreposto + stats), adaptado ao contexto social.

## Layout do novo `CommunityHeaderCard`

```
┌──────────────────────────────────────┐
│ [cover gradiente magenta]   🔲  ✈️ │ ← botões grade + DM (com badge)
│      ╭──────╮                        │
│      │AVATAR│                        │
│      ╰──────╯                        │
├──────────────────────────────────────┤
│  Olá, {nome}                         │
│  Comunidade We Diet                  │
│  ─────── stats ───────              │
│  📷 12     ❤️ 87     👥 1.2k        │
│  PUBLIQUEI CURTIDAS  MEMBROS         │
└──────────────────────────────────────┘
```

Visual coerente com o card do perfil:
- Container: `rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 shadow-xl`
- Cover: `aspect-[3/1]`, `bg-gradient-to-br from-[#FD46A1] to-[#FF8FC4]`
- Avatar: `w-24 h-24 -mt-12 ml-5 border-4 border-white`
- Botões Grade e DM no canto superior direito do cover (`bg-black/40 backdrop-blur` quando inativo, `bg-[#FD46A1]` quando ativo). Badge de DM não lidos mantém vermelho/rosa atual.
- Stats: 3 chips `bg-[#FFD1E7]/60 rounded-2xl`, ícones `#FD46A1`

## Stats (consultas)
- **Minhas publicações**: `community_posts` count where `user_id = me`
- **Curtidas recebidas**: soma de `likes_count` em `community_posts` minhas
- **Membros**: count distinct de `user_id` em `community_posts` (proxy de comunidade ativa). Formatar com `1.2k` se ≥ 1000.

Carregar em paralelo (`Promise.all`) no `useEffect` do componente.

## Arquivos
- **Novo**: `src/components/community/CommunityHeaderCard.tsx` — recebe props `userId`, `userName`, `userAvatar`, `view`, `onToggleView`, `unreadDM`, `onOpenDM`
- **Editar**: `src/pages/Comunidade.tsx` — substituir o bloco `<div className="bg-gradient-to-r ...">` (linhas ~112-139) por `<CommunityHeaderCard ... />`. Remover import `Users` se não usado em outro lugar do arquivo.

## Fora de escopo
- Não mexer no feed, stories, modais ou no botão flutuante "+"
- Não criar nova tabela; nenhuma migration
