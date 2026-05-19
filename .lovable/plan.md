## Problema

Hoje o confete só não dispara duas vezes na mesma sessão (graças ao `revealedMessageIds` em memória no `ToAquiChat`). Mas se o usuário sai e volta para o chat do venue, o state é recriado vazio e o confete dispara de novo para mensagens `__match_reveal__:` antigas.

## Solução

Persistir por mensagem que o confete já foi disparado, igual fizemos com o "dispensado".

### `MatchRevealBanner.tsx`
- Nova chave: `to-aqui:match-reveal-confetti:${messageId}` no `localStorage`.
- No `useEffect` que dispara o confete:
  - Antes de animar, ler a chave. Se já existe, sair sem disparar.
  - Após disparar, gravar `"1"` na chave.
- O `ref` local `fired` continua, para evitar duplicar no mesmo mount.

Nenhuma outra mudança — `ToAquiChat` continua passando `fireConfetti={isNew}` (ainda útil pra não animar em mensagens já marcadas em memória), e o banner agora também respeita o persistido.

## Fora de escopo
- Não mexer no banco, no toast, no botão "Abrir conversa" nem na lógica de dismiss já implementada.
