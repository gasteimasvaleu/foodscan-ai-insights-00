## Novo input de chat (estilo PromptInputBox) em 4 telas

Adaptar a UX enviada para o tema We Diet (claro/rosa) e aplicar em **NutriCoach, Chat Global, DM e Tô Aqui**, com 3 ações: anexar imagem, gravar voz e enviar.

---

### 1) Componente compartilhado `src/components/chat/ChatInputBar.tsx`

Wrapper único reutilizável (sem search/think/canvas), tema We Diet:

- **Container**: `rounded-3xl border border-[#FD46A1]/30 bg-white/80 backdrop-blur-md shadow-lg` + padding 2.
- **Textarea autosize** (max-h 160px), `text-base` (anti-zoom iOS), placeholder configurável.
- **Preview de anexos**: chip 64×64 com imagem + botão "X" (igual ao exemplo, mas borda rosa).
- **Botão clipe** (`Paperclip`) à esquerda → abre file picker, só imagens, máx 10 MB. Opcional via prop `enableAttachments`.
- **Botão principal** circular à direita (40×40):
  - Sem conteúdo → ícone `Mic`, fundo `bg-[#FD46A1]/10`, ícone rosa.
  - Com texto/anexo → ícone `ArrowUp`, fundo `#FD46A1`, ícone branco (envia).
  - Gravando → `StopCircle` vermelho.
  - Loading → `Square` pulsando.
- **Modo gravação**: substitui textarea por bloco com bolinha vermelha pulsando, timer `mm:ss` e 32 barrinhas animadas (waveform fake, igual ao exemplo). Botão X para cancelar.
- Props: `onSend(text, files)`, `placeholder`, `isLoading`, `enableAttachments`, `enableVoice`, `className`.

### 2) Gravação de voz → transcrição (ElevenLabs)

Voz vira **texto** no campo (usuário revisa e envia). Sem novas colunas no DB.

- `MediaRecorder` no cliente captura webm/opus.
- Ao parar: POST do blob para nova edge function `transcribe-audio`.
- Edge function chama ElevenLabs `scribe_v2` (`language_code: por`) e devolve `{ text }`.
- Texto retornado é concatenado ao input atual; usuário envia manualmente.
- Secret necessário: `ELEVENLABS_API_KEY` (será solicitado).

### 3) Anexos por tela

| Tela | Bucket | Schema | Ação |
|---|---|---|---|
| DM | `dm-media` (existe) | `dm_messages.image_url`, `storage_path` (existem) | só wireup |
| Chat Global | `community-images` (existe) | adicionar `image_url text`, `storage_path text` em `chat_messages` | migration |
| Tô Aqui | novo `venue-chat-media` (público) | adicionar `image_url text`, `storage_path text` em `venue_messages` | migration + bucket + policies |
| NutriCoach | sem persistência | mandar base64 ao edge function `nutri-coach` como `image_data` (vision) | ajustar edge function |

### 4) Substituições nas páginas

Trocar o `<textarea>+botão` atual por `<ChatInputBar …/>` mantendo a lógica de envio existente em:

- `src/pages/NutriCoach.tsx` (linha ~263): `enableAttachments`, `enableVoice`.
- `src/pages/ChatGlobal.tsx` (linha ~359): idem.
- `src/pages/DMThread.tsx` (linha ~261): idem.
- `src/pages/ToAquiChat.tsx` (linha ~917): idem.

Cada `onSend` continua chamando o respectivo `handleSend`/insert no Supabase. Se `files[0]` existir, faz upload no bucket correto antes de inserir a mensagem com `image_url`.

### 5) Detalhes técnicos

- Não usar `document.createElement("style")` do snippet original — colocar utilitários de scrollbar diretamente em `src/index.css`.
- Usar `framer-motion` (já instalado) para waveform/transições.
- Usar `@radix-ui/react-tooltip` (shadcn `Tooltip` já no projeto) ao invés de importar primitives diretamente.
- iOS: respeitar `safe-area-inset-bottom` no container do input (manter como já está hoje).
- Sem `console.log` em produção, sem alterações no tema escuro.

### 6) Ordem de entrega sugerida

1. Migration (colunas + bucket Tô Aqui).
2. `ChatInputBar` (visual + autosize + envio).
3. Wireup nas 4 páginas com upload de imagem.
4. Edge function `transcribe-audio` + secret + integração de voz.