## "Já sei quem é você" — palpite de identidade

Nova interação que permite a um usuário arriscar o nome real (ou apelido) de outro no chat do venue. O receptor confirma se acertou ou não. Acerto vira um "match revelado": confete, mensagem destacada no chat do venue com avatares pulsando, entrada em Atividades e DM criada.

## Fluxo

1. No drawer de interações (avatar de outro usuário), além das 4 ações atuais, aparece um botão extra **"🕵️ Já sei quem é você"**.
2. Abre um Dialog com input de texto (1–40 chars). Sender escreve o palpite e envia.
3. Cooldown de 5 min entre tentativas do mesmo par sender→receiver. Sem limite total.
4. Receptor recebe um Dialog (não toast — precisa de ação): "Alguém acha que sabe quem é você: **<palpite>**. Acertou?" com botões **Acertou** / **Errou**. O remetente fica anônimo aqui (apelido do venue, nunca nome real).
5. **Errou**: sender recebe toast "😅 Errou! Tenta de novo daqui a 5 min". Nada vai pro chat.
6. **Acertou**:
   - Trigger insere mensagem de sistema em `venue_messages` (tipo `match_reveal`) com os dois apelidos atuais do venue.
   - Trigger cria/reaproveita DM em `dm_conversations` (mesma lógica de match já existente) e grava `dm_conversation_id` no registro.
   - Ambos clientes recebem via realtime → disparam **confete** (canvas-confetti) + animação de pulso nos avatares dos 2 usuários por ~4s.
   - Aparece na página Atividades como um novo tipo de match ("Descoberta").

## Anonimato

- Mensagem no chat usa **apelidos do venue** (`venue_memberships.display_alias` ou nome real conforme `display_mode`), nunca quebra o anonimato configurado. O "acerto" apenas confirma para o sender, em privado, que o palpite estava certo — não revela o nome real publicamente.
- Sender é sempre exibido pelo apelido atual no venue, tanto pro receptor quanto no chat público.

## Banco de dados

Nova tabela `venue_guesses`:

```text
id              uuid pk
venue_id        uuid (fk venues)
sender_id       uuid
receiver_id     uuid
guess_text      text (1..40, trim)
status          text default 'pending'  -- pending | correct | wrong
dm_conversation_id uuid null
created_at      timestamptz default now()
resolved_at     timestamptz null
```

Índices: `(receiver_id, status)`, `(sender_id, receiver_id, created_at desc)`.

RLS:
- INSERT: sender autenticado, `sender_id = auth.uid()`, `can_access_venue(venue_id, auth.uid())`, sender ≠ receiver.
- SELECT: sender OU receiver.
- UPDATE: apenas receiver, e só pode mudar `status` de `pending` para `correct`/`wrong`.

Triggers:
- `venue_guesses_before_insert`: enforce cooldown de 5 min entre o mesmo par sender→receiver com status `pending` ou criados há menos de 5min; banword filter no `guess_text`; rate limit global (20/h por sender, igual `venue_interactions`).
- `venue_guesses_after_update`: quando `status` muda para `correct`:
  - Cria/reaproveita `dm_conversations` (mesma lógica do trigger `venue_interactions_after_insert`).
  - Insere row em `venue_messages` com prefixo `__match_reveal__:{sender_alias}|{receiver_alias}` (parseado no front) — assim reusa o canal realtime existente sem nova tabela.
  - Atualiza `dm_conversation_id`.

Realtime: habilitar `REPLICA IDENTITY FULL` e publicação em `venue_guesses` para o receptor ouvir INSERT e o sender ouvir UPDATE.

## Frontend

**Dependência nova**: `canvas-confetti` (~3KB) — leve, sem React.

**`src/pages/ToAquiChat.tsx`**:
- Botão extra "🕵️ Já sei quem é você" no grid de interações.
- Novo Dialog `GuessIdentityDialog`: input + envio → insert em `venue_guesses`.
- Novo Dialog `IncomingGuessDialog`: aberto quando chega INSERT em `venue_guesses` com `receiver_id = me` → mostra palpite + botões Acertou/Errou → UPDATE status.
- Listener UPDATE em `venue_guesses` filtrado por `sender_id = me` → toast com resultado.
- Listener nas mensagens do venue: quando vier conteúdo com prefixo `__match_reveal__:`, renderiza um **MatchRevealBanner** centralizado (não bolha) com 2 avatares animados (pulse + ring `#FD46A1`) e dispara confete uma vez.
- Componente novo `MatchRevealBanner.tsx` em `src/components/to-aqui/`.

**`src/pages/ToAquiActivity.tsx`**:
- Adicionar seção/aba "Descobertas" listando `venue_guesses` onde sou sender ou receiver com `status = 'correct'`.

## O que NÃO muda

- Lógica de paquera/drink/mesa/conta intacta.
- Tabela `venue_interactions` não é alterada.
- Nomes reais nunca aparecem no chat público.

## Pontos de verificação

- Testar com 2 contas: sender erra → toast certo; sender acerta → ambos veem banner + confete + DM disponível.
- Cooldown de 5 min retornando mensagem amigável no front.
- Banner aparece também ao recarregar (mensagem persistida em `venue_messages`).