## Objetivo
Remover o modal/overlay do chat em `/nutri-coach` e renderizar o chat **inline**, abaixo do card header com o título "NutriCoach", ocupando o espaço restante da tela até o Navbar inferior.

## Mudanças em `src/pages/NutriCoach.tsx`

1. **Remover**:
   - Estado `chatOpen` e `useEffect` que bloqueia `body.overflow`
   - Card de descrição "Seu Assistente de Nutrição" + botão "Abrir Chat"
   - Bloco inteiro do overlay (`{chatOpen && (...)}`) com backdrop e painel flutuante
   - Imports não usados (`X` do lucide-react)

2. **Layout novo**:
   - Container raiz mantém `min-h-screen flex flex-col` + Navbar topo
   - Wrapper interno vira `flex-1 flex flex-col` com `pt-[calc(env(safe-area-inset-top)+4rem)] pb-28` (espaço pro Navbar inferior) e `max-w-3xl mx-auto w-full px-4`
   - Card header (gradient pink com título "NutriCoach") permanece no topo, `shrink-0`
   - Logo abaixo, novo container `flex-1 flex flex-col min-h-0 rounded-2xl bg-white border border-primary/20 shadow-sm overflow-hidden mt-4`:
     - **Mensagens**: `flex-1 overflow-y-auto px-4 py-4 space-y-4`
     - **Input**: `border-t bg-white p-3` com textarea + botão Send (mesma estrutura atual)

3. **Comportamento**:
   - Chat já carrega automaticamente com `WELCOME_MESSAGE` ao entrar na página
   - Lógica de `send`, `streamChat`, `userContext`, `handleKeyDown` permanece igual
   - Auto-scroll do `scrollRef` continua funcionando
   - Mantém `text-base` no textarea pra evitar zoom no iOS

4. **Espaçamento iOS/teclado**: como o problema do teclado já foi resolvido no Capacitor (resize native), basta `pb-28` ou `pb-32` no container externo pra não cobrir o input com o Navbar inferior — sem precisar de `pb-40` agressivo do modal.

## Fora do escopo
- Persistência de histórico do chat
- Mudanças no edge function `nutri-coach-chat`
- Mudanças visuais no Navbar inferior
