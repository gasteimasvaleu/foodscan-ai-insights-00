## Objetivo

Mover o botão ✨ (dica misteriosa via IA) do chat do Tô Aqui para **dentro** do `ChatInputBar`, posicionado ao lado do botão de anexar imagem (📎), em vez de ficar como um botão flutuante separado à esquerda do input.

## Mudanças

### 1. `src/components/chat/ChatInputBar.tsx`
- Adicionar nova prop opcional `leadingActions?: React.ReactNode` na interface `ChatInputBarProps`.
- Renderizar `{leadingActions}` dentro da linha de ações (div `flex items-center gap-1` na linha 295), **logo após** o botão de anexar (Paperclip), só quando `!isRecording`.
- Isso permite reaproveitar o slot em qualquer chat que precise adicionar botões extras (ex.: sparkles, emoji, etc.).

### 2. `src/pages/ToAquiChat.tsx`
- Remover o `<Button>` Sparkles externo (linhas 927–936) e o wrapper `<div className="flex gap-2 items-end">` extra.
- Passar o botão Sparkles via prop `leadingActions` para o `ChatInputBar`, com o mesmo estilo arredondado e cor #FD46A1, e o mesmo `onClick={() => setHintOpen(true)}` / `disabled={needIdentity}`.
- Resultado final: o input ocupa 100% da largura e dentro dele aparecem, da esquerda para a direita: 📎 anexar → ✨ dica misteriosa → (espaço) → 🎤/➤ enviar.

## Detalhes técnicos

```tsx
// ChatInputBar.tsx
export interface ChatInputBarProps {
  // ... existentes
  leadingActions?: React.ReactNode;
}

// dentro do render, na linha de ações:
<div className="flex items-center gap-1">
  {enableAttachments && !isRecording && (<button>...Paperclip...</button>)}
  {!isRecording && leadingActions}
</div>
```

```tsx
// ToAquiChat.tsx — composer
<ChatInputBar
  onSend={(t, files) => send(t, files)}
  onTextChange={setInput}
  placeholder="Mensagem..."
  isLoading={sending}
  disabled={needIdentity}
  maxLength={500}
  leadingActions={
    <button
      type="button"
      onClick={() => setHintOpen(true)}
      disabled={needIdentity}
      className="h-9 w-9 rounded-full flex items-center justify-center text-[#FD46A1] hover:bg-[#FD46A1]/10 transition disabled:opacity-40"
      aria-label="Dica misteriosa via IA"
    >
      <Sparkles className="w-5 h-5" />
    </button>
  }
/>
```

## Fora de escopo
- Não altera lógica do `hint dialog`, do envio, nem dos outros chats (NutriCoach, DM, Chat Global da comunidade) — eles continuam sem `leadingActions`.