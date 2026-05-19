## Ideia

Ótima sugestão. Hoje quem entra no chat de um venue não tem nenhuma pista visual de que pode tocar no avatar de outro usuário para enviar uma paquera, drink, mesa ou conta — e que dois envios mútuos viram match e abrem uma DM. Um modal de boas-vindas resolve isso.

## Comportamento

- Exibir 1× por usuário ao entrar em qualquer `/to-aqui/venue/:id/chat`.
- Persistência da flag em `localStorage` (`toAquiChatOnboardingSeen=true`) — sem migração de banco.
- Botão "Entendi" fecha e marca como visto. Link discreto "Ver de novo" no header do chat (ícone de ajuda `HelpCircle`) reabre quando quiser.

## Conteúdo do modal

Título: "Como funciona o chat do local"

3 passos curtos com ícone + texto:
1. 👤 **Toque no avatar** de qualquer pessoa para abrir as ações.
2. 💘🍹🪑💸 **Envie uma paquera, drink, mesa ou conta** — discreto e sem mensagem.
3. ✨ **Match!** Quando alguém retribuir a mesma ação, abre uma conversa privada (DM).

Rodapé: aviso de respeito + botão "Entendi".

## Visual

- Componente `VenueChatOnboardingModal.tsx` em `src/components/to-aqui/`.
- `Dialog` shadcn com glassmorphism (`bg-white/80 backdrop-blur-md`, `rounded-3xl`) seguindo o padrão do app.
- Ícones via `lucide-react` + emojis das interações já definidas em `INTERACTIONS`.
- Botão "Entendi" com `bg-[#FD46A1]`.

## Arquivos

- **Novo**: `src/components/to-aqui/VenueChatOnboardingModal.tsx`
- **Editar**: `src/pages/ToAquiChat.tsx`
  - Estado `showOnboarding` inicializado a partir do localStorage no primeiro render.
  - Botão `HelpCircle` no header próximo ao "Voltar" para reabrir.
  - Renderizar o modal no final do JSX.

## O que NÃO muda

- Nenhuma mudança de banco, RLS ou edge function.
- Lógica de interações/match permanece intocada.