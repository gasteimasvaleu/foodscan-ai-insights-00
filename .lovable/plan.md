## Objetivo

Adicionar, ao lado do botão de Atividade (header do chat do venue), um botão que abre um modal padrão do app listando todos os usuários online no chat naquele momento.

## Arquivo único

`src/pages/ToAquiChat.tsx`

## Mudanças

1. **State novo**
   - `onlineUserIds: string[]` — lista de user_ids presentes no canal.
   - `onlineModalOpen: boolean`.

2. **Presence sync (linhas 201-204)**
   - Hoje só seta `onlineCount`. Atualizar também `setOnlineUserIds(Object.keys(state))`.
   - Manter `setOnlineCount` para o subtítulo.
   - Observação: `fetchOnlineDb` continua só ajustando o contador (não temos ids pelo RPC), então o modal mostra os usuários do canal realtime — fonte de verdade dos "conectados agora".

3. **Botão novo no header (entre os dois botões já existentes, ~linha 590)**
   - Ícone `Users` (já importado), `variant="ghost" size="icon"`, cor `#FD46A1`.
   - `aria-label="Quem está online"`.
   - `onClick`: abre o modal e dispara `refreshMembers(onlineUserIds)` para garantir avatar/nome de quem ainda não apareceu no chat.
   - Badge pequeno (mesmo estilo do badge de interações) no canto superior direito com `onlineCount`.

4. **Modal (Dialog do shadcn — padrão glassmorphism do app)**
   - `DialogContent` com `bg-white/70 backdrop-blur-md`, `rounded-3xl`, `max-h-[80vh] overflow-y-auto`.
   - `DialogHeader`: título "Online agora" + `DialogDescription` com `{onlineCount} {pessoa/pessoas} no chat`.
   - Lista de itens (uma linha por user_id em `onlineUserIds`):
     - Avatar (mesma lógica usada nas mensagens: se `display_mode === "anonymous"`, mostrar inicial do alias dentro de um círculo cinza com ícone genérico; senão `avatar_url` ou inicial do nome).
     - Nome: alias (se anônimo) ou `profile_name`.
     - Badge "Você" para o próprio user.
   - Estado vazio: "Ninguém online no momento."
   - Sem ações por linha (apenas visualização) — mantém escopo mínimo.

## Fora do escopo

- Não mexer no contador/subtítulo do header (já existe e fica).
- Não criar tabela nem RLS — usa o `presenceState()` já existente.
- Sem mudança no botão de Atividade nem no botão Voltar.
- Sem ações de DM/paquera direto pelo modal (pode ser uma próxima iteração se você quiser).
