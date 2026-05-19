## Plano

1. **Header do chat (`ToAquiChat.tsx`)**
   - Remover o ícone de IA (`Sparkles`) do topo. A geração de dicas continua disponível pelo botão ao lado do input.
   - Colocar no lugar um botão "Atividade" (ícone `Activity` / coração com pulso) que leva para a nova página de atividades daquele venue.

2. **Nova página `ToAquiActivity`** (rota `/to-aqui/venue/:id/atividade`)
   - Mostra a lista de interações do usuário logado naquele venue: enviadas e recebidas (paquera, drink, mesa, conta).
   - Cada item exibe: tipo + emoji, nome (ou "Anônimo"/apelido) do outro lado, direção (você → fulano / fulano → você), data relativa, e badge "Match 💞" quando `dm_conversation_id` estiver preenchido.
   - Botões: "Abrir conversa" quando houver match (vai para `/comunidade/dm/:id`) e "Retribuir" para sinais recebidos sem match (envia o mesmo `type` de volta).
   - Filtros simples: "Tudo / Enviadas / Recebidas / Matches".
   - Estado vazio amigável.

3. **Rota e navegação**
   - Adicionar `<Route path="/to-aqui/venue/:id/atividade" element={<ToAquiActivity />} />` em `App.tsx`.
   - Manter a página em tela cheia no mesmo padrão (esconder Navbar como já é feito para `/chat`).

4. **Padrão visual**
   - Header rosa #FD46A1, cartões `bg-[#FFD1E7]` `rounded-3xl`, glassmorphism nos modais (nenhum modal novo é necessário).
   - Sem mexer em backend nem no schema.

## Detalhes técnicos
- Arquivos:
  - `src/pages/ToAquiChat.tsx` (header: substitui botão Sparkles por Activity → `navigate('/to-aqui/venue/${venueId}/atividade')`).
  - `src/pages/ToAquiActivity.tsx` (novo): query `venue_interactions` filtrando por `venue_id` e `(sender_id = me OR receiver_id = me)`, join leve em `venue_memberships` + `profiles` para mostrar nome/avatar respeitando `display_mode`.
  - `src/App.tsx`: nova rota + adicionar regex no guard de Navbar para esconder também em `/atividade` (opcional, ou manter Navbar — usar o mesmo padrão do `/venue/:id`).