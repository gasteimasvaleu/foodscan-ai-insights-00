## Objetivo

No botão de "Atividade" (ícone Activity) no header do chat do venue (`/to-aqui/venue/:id/chat`), mostrar um badge com o número de interações novas recebidas e fazer o botão pulsar enquanto houver alguma.

## Como funciona hoje

- O chat já assina em tempo real `venue_interactions` filtrando `receiver_id=eq.${user.id}` e dispara um toast (linhas 213-232).
- O botão de atividade só navega para `/to-aqui/venue/:id/atividade`, sem qualquer indicador visual.

## Plano

**Arquivo único:** `src/pages/ToAquiChat.tsx`

1. **State** — `const [newInteractionsCount, setNewInteractionsCount] = useState(0)`.
2. **Chave de "última visita"** em `localStorage`: `toaqui-activity-seen-${venueId}-${user.id}` guardando ISO timestamp.
3. **Carga inicial** — após login/venue prontos, fazer um `SELECT count(*)` em `venue_interactions` filtrando `receiver_id=user.id`, `venue_id=venueId`, `created_at > lastSeen` e setar no state.
4. **Realtime** — no handler que já existe (INSERT em `venue_interactions` recebido), incrementar `newInteractionsCount` além de mostrar o toast.
5. **Botão Activity (linha 576-584)**:
   - Wrappear em `relative`.
   - Quando `newInteractionsCount > 0`, adicionar classe `animate-pulse` no botão.
   - Renderizar um badge absoluto no canto superior direito: círculo rosa pequeno (`bg-[#FD46A1] text-white`, `text-[10px]`, `rounded-full`, `min-w-[18px] h-[18px]`) com o número (mostrar `9+` se ≥ 10).
6. **Reset ao clicar** — no `onClick` do botão, antes de navegar: gravar `localStorage[lastSeenKey] = new Date().toISOString()` e `setNewInteractionsCount(0)`.

## Sem mudanças

- Sem alteração de banco / RLS.
- Sem novas dependências.
- Toast e demais comportamentos do chat permanecem iguais.
