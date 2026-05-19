## Interações no chat do venue (Tô Aqui)

DB já está pronto: tabela `venue_interactions` + triggers de rate-limit, cooldown e match→DM automático. Falta só UI e a edge function da dica via IA.

### 1. Edge function `venue-mystery-hint`
- Input: `{ raw_hint: string, lang?: "pt-BR" }`.
- Chama Lovable AI (`google/gemini-3-flash-preview`) com system prompt: "transforme em 3 dicas curtas, misteriosas e poéticas em PT-BR sobre a pessoa, **sem revelar identidade**, sem links/telefones/emails, max 80 chars cada".
- Retorna `{ hints: string[] }` via tool-calling (structured output).
- CORS + 429/402 tratados.

### 2. Tipos de interação (frontend-only constants)
| type | emoji | label |
|------|-------|-------|
| `flirt` | 💘 | Paquera |
| `drink` | 🍹 | Oferecer drink |
| `sit_table` | 🪑 | Convidar pra mesa |
| `pay_bill` | 💸 | Pagar sua conta |

### 3. UI em `src/pages/ToAquiChat.tsx`

**a) Click em bolha de outra pessoa** → abre `Drawer` glassmorphism com:
- Avatar + nome (ou "?" se anônimo).
- Grid 2x2 dos 4 tipos acima. Cada botão faz `insert` em `venue_interactions` e fecha o drawer com toast: "Sinal enviado de forma anônima. Vira match se a outra pessoa retribuir 💞".
- Erros amigáveis: `rate_limit`, `cooldown`.

**b) Botão "🔮 Dica misteriosa via IA"** no header do chat → abre `Dialog`:
- `Textarea` com placeholder "Camisa preta na mesa do canto, fã de rock…" (max 200).
- Botão "Gerar com IA" (loader) → chama edge function → mostra 3 sugestões clicáveis.
- Ao clicar numa sugestão: envia como mensagem normal em `venue_messages` com prefixo `🔮 ` (todos no chat veem).

**c) Realtime de sinais recebidos**: novo channel `venue-int-${venueId}-${userId}` com `postgres_changes` em `venue_interactions` filtrado por `receiver_id=eq.<me>`. Mostra toast: "Alguém te mandou {emoji} {label} aqui!" (sem revelar quem).

**d) Detecção de match**: subscribe a UPDATEs de `venue_interactions` onde `sender_id=me` e `dm_conversation_id IS NOT NULL` → toast com botão "Abrir conversa" que navega para `/comunidade/dm/{dm_conversation_id}`.

### 4. Memória
Atualizar `mem://features/to-aqui/core` listando interações implementadas + função `venue-mystery-hint`.

### Arquivos
- novo: `supabase/functions/venue-mystery-hint/index.ts`
- editar: `src/pages/ToAquiChat.tsx` (drawer + dialog + realtime extra)

Nenhuma alteração de schema.
