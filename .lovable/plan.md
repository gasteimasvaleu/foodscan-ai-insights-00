## Problema

A mensagem é gravada no banco corretamente (verifiquei: registro existe em `chat_messages` com `is_deleted=false`), mas não aparece para quem enviou. Hoje o `ChatGlobal.tsx` confia 100% no evento realtime `postgres_changes INSERT` para adicionar qualquer mensagem nova (própria ou de outros) ao state. Se esse evento demorar, falhar ou o canal ainda não estiver `SUBSCRIBED`, a mensagem fica invisível mesmo já estando no banco.

## Solução

Atualização otimista local no momento do envio, mantendo o realtime como reforço para mensagens de outros usuários (com deduplicação por `id`, que já existe).

### Mudanças em `src/pages/ChatGlobal.tsx`

1. Na função `send()`:
   - Trocar o insert por `.insert(...).select("id, user_id, content, created_at, is_deleted").single()`
   - Em caso de sucesso, adicionar a mensagem retornada ao state imediatamente (com `ensureProfile` do próprio usuário) e fazer scroll
   - O handler realtime já ignora duplicados (`prev.some(m => m.id === msg.id)`), então não vai duplicar quando o evento chegar

2. Pequeno hardening adicional:
   - Garantir que o profile do usuário logado seja pré-carregado no cache assim que o componente monta (hoje só é carregado quando o canal entra em `SUBSCRIBED`), para a mensagem otimista já mostrar nome/avatar

Nada mais muda — RLS, trigger de moderação, presence e realtime continuam iguais.

### Por que isso resolve

- Quem envia vê a própria mensagem imediatamente, sem depender de roundtrip realtime
- Outros usuários continuam recebendo via `postgres_changes`
- Sem duplicação graças ao guard por `id` já existente