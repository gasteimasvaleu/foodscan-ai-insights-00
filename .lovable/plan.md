# Corrigir crash ao gravar áudio nos chats (iOS nativo)

## Diagnóstico

O crash não é específico do Tô Aqui — ele atinge qualquer chat que use o `ChatInputBar` (Tô Aqui, DM, Chat Global). Duas causas combinadas no iOS:

1. **Falta `NSMicrophoneUsageDescription` no `Info.plist`.** Hoje o arquivo `ios/App/App/Info.plist` não tem essa chave. Quando o JS chama `navigator.mediaDevices.getUserMedia({ audio: true })`, o iOS **mata o app imediatamente** (política da Apple). Esse é o crash que você está vendo.
2. **MIME type do `MediaRecorder`.** O código atual só tenta `audio/webm;codecs=opus` e `audio/webm`. Safari/WKWebView no iOS **não suportam webm**; o construtor lança `NotSupportedError`. Mesmo depois de adicionar a permissão, a gravação falharia.

## Mudanças

### 1. `ios/App/App/Info.plist`
Adicionar a chave de uso do microfone (PT-BR, conforme padrão das outras descrições):

```
<key>NSMicrophoneUsageDescription</key>
<string>O We Diet usa o microfone para você gravar áudios no chat da comunidade, DMs e Tô Aqui.</string>
```

### 2. `src/components/chat/ChatInputBar.tsx`
Tornar a escolha do MIME compatível com iOS, na ordem: `audio/mp4`, `audio/aac`, `audio/webm;codecs=opus`, `audio/webm`, fallback default. Trocar o nome do arquivo enviado ao backend conforme o MIME real (`audio.m4a` para mp4/aac, `audio.webm` caso contrário) para o STT identificar o formato corretamente.

Também envolver `MediaRecorder.isTypeSupported` em try/catch defensivo (alguns WebViews antigos não expõem a função) e, se mesmo assim o construtor falhar, exibir o toast "Microfone indisponível" em vez de propagar exceção.

### 3. `supabase/functions/transcribe-audio/index.ts`
Passar adiante o nome de arquivo recebido (em vez de fixar `audio.webm`) para que o ElevenLabs Scribe reconheça áudio `m4a`/`aac` vindo do iOS. Continua compatível com webm do web/Android.

## Após a aplicação

Como mudou o `Info.plist`, é necessário rebuild nativo (não basta Live Update OTA):
- `npx cap sync ios`
- Novo build/upload pela Appflow → App Store Connect.

Sem o rebuild com a nova chave, o crash continuará ocorrendo mesmo com o fix de JS.

## Fora de escopo

- Não vou mexer no fluxo de envio de áudio em si (transcrição → texto), nem na UI da barra. Apenas compatibilidade iOS.
- Não vou alterar `whatsapp-process-image` nem outras edge functions.
