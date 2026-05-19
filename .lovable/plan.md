## Problema

Após o palpite ser marcado como "Acertou", o trigger do banco está funcionando corretamente: cria/reaproveita a `dm_conversation`, preenche `venue_guesses.dm_conversation_id`, marca `resolved_at`, e posta a mensagem `__match_reveal__:` no chat do venue (com confete + banner). Verificado em produção: o último palpite tem `status=correct` e `dm_conversation_id=025eb8fc-...`.

**O que está faltando**: em momento nenhum o front leva o sender ou o receiver até essa DM. Hoje só aparece um toast genérico ("🎉 Vocês se descobriram!" / "Uma conversa privada foi aberta"), sem botão clicável. A pessoa precisa adivinhar sozinha que tem que ir até `/comunidade/dm` e procurar a conversa.

## Solução proposta

Adicionar ações de navegação direta para `/comunidade/dm/:dmConversationId` em três pontos:

### 1. `IncomingGuessDialog.tsx` (quem recebeu o palpite e marcou "Acertou")

- Após o `update` retornar com sucesso (status `correct`), buscar o `dm_conversation_id` da própria linha que acabou de ser atualizada (já vem preenchido pelo trigger BEFORE UPDATE).
- Trocar o toast atual por um Dialog de confirmação curto (ou um toast com action button) com botão **"Abrir conversa"** que faz `navigate(\`/comunidade/dm/${id}\`)`.

### 2. `ToAquiChat.tsx` — listener UPDATE em `venue_guesses` para o sender

- Hoje o handler do canal `venue-guess-${venueId}-${user.id}` já recebe o UPDATE com `payload.new.status === 'correct'` e mostra toast. Adicionar `payload.new.dm_conversation_id` ao toast com action button "Abrir conversa" → `navigate(\`/comunidade/dm/${dmConversationId}\`)`.
- Caso `dm_conversation_id` venha null (raro, fallback), navegar pra `/comunidade/dm`.

### 3. `MatchRevealBanner.tsx` (mensagem no chat do venue para ambos)

- Adicionar um botão pequeno **"Abrir DM"** abaixo do texto do banner, visível só para os 2 participantes do match.
- Para isso o banner precisa receber `senderId`, `receiverId` e o `user.id` atual. Quando `user.id` for um dos dois, faz `get_or_create_dm_conversation(otherId)` (RPC já existente) e navega.
- Alternativa mais simples: o banner só mostra o botão; ao clicar chama o RPC e navega — sem precisar passar o `dm_conversation_id` na própria mensagem (a mensagem `__match_reveal__:` só carrega aliases, não IDs).

### 4. (opcional, sugiro incluir) Toast com action button reutilizável

Usar a prop `action` do `useToast` (shadcn) com `ToastAction` para ter um botão real dentro do toast em vez de só texto — assim sender e receiver têm um caminho claro de 1 clique.

## Fora de escopo

- Não mexe no banco/trigger (já está correto).
- Não muda lógica de criação de DM.
- Não mexe na anonimato — a navegação para `/comunidade/dm/:id` já respeita o que `DMThread` mostra hoje.

## Arquivos a editar

- `src/components/to-aqui/IncomingGuessDialog.tsx` — capturar `dm_conversation_id` do update, navegar / oferecer botão
- `src/pages/ToAquiChat.tsx` — toast com action no listener UPDATE; passar `userId/senderId/receiverId` para o `MatchRevealBanner`
- `src/components/to-aqui/MatchRevealBanner.tsx` — botão "Abrir conversa" + chamada ao RPC `get_or_create_dm_conversation`
