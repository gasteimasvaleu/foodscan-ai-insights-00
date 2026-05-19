## Objetivo

No card "Chat" da página do venue (`/to-aqui/venue/:id`), exibir em tempo real quantas pessoas estão online no chat daquele local.

## Como funciona hoje

- O chat (`ToAquiChat.tsx`) já usa um canal Supabase Realtime `venue-${venueId}` com `presence` e também grava registros em `venue_presence` ao entrar/sair.
- A página do venue (`ToAquiVenue.tsx`, linha 91-95) tem um quadradinho "Chat" no grid de 3 estatísticas que hoje só mostra o ícone e o label.

## Plano

1. **`ToAquiVenue.tsx`** — assinar o mesmo canal de presence `venue-${id}` (sem `track`, apenas observador) para contar usuários únicos online em tempo real.
   - `useEffect` cria `supabase.channel("venue-{id}", { config: { presence: { key: "viewer-{random}" } } })`.
   - Listener `presence sync` lê `presenceState()` e atualiza `onlineCount = Object.keys(state).length`.
   - Cleanup com `removeChannel` no unmount.
2. **Card "Chat"** (linha 92-95) — passar a mostrar o número:
   - Número grande (ex.: `text-base font-semibold text-gray-800`) acima do label "Chat".
   - Label vira "online" (mantendo padrão do card "Local" que tem valor + label).
   - Se `onlineCount === 0`, mostrar `0` normalmente.
3. **Sem mudanças de banco** — usa apenas presence em memória, igual ao chat já faz.

## Detalhes técnicos

- O viewer não chama `track()`, então não conta como "online" — só observa.
- Como o chat usa `presence.key = user.id`, a contagem reflete usuários únicos.
- Usar `useRef` para o channel + `useState<number>` para o count, igual ao padrão já existente em `ToAquiChat.tsx`.
