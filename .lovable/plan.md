# Corrigir estouro de layout ao abrir teclado nos comentários (iOS)

## Problema
Quando o usuário toca no input de comentário dentro de `CommentSection` (renderizado dentro do `PostCard` na página `/comunidade`), o teclado nativo do iOS sobe e o layout "estoura": o input fica escondido atrás do teclado e a página perde o scroll, dando sensação de crash.

Causas prováveis:
1. O `Input` de comentário está dentro de um card no meio do feed, sem rolagem para colocá-lo acima do teclado.
2. O container `Comunidade` usa `pb-44` mas não reage à altura do teclado.
3. Falta `scrollIntoView` no foco do input para reposicioná-lo.
4. O Capacitor Keyboard plugin não está configurado para ajustar a viewport (`resize: 'native'` / `KeyboardResize.Body`).

## Mudanças

### 1. `src/components/community/CommentSection.tsx` (UI)
- Adicionar `ref` no `Input` de comentário.
- No `onFocus`, chamar `inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })` após pequeno delay (300ms) para garantir que o input fique visível acima do teclado.

### 2. `src/components/community/PostCard.tsx` (UI)
- Garantir que o bloco de comentários tenha margem inferior suficiente (`pb-4`) e que o card não trave overflow.

### 3. `capacitor.config.ts` (config nativa)
- Adicionar plugin Keyboard:
  ```ts
  plugins: {
    Keyboard: {
      resize: 'native',
      style: 'light',
      resizeOnFullScreen: true,
    }
  }
  ```
- Isso faz o WebView nativo redimensionar quando o teclado abre, evitando o "estouro".

### 4. `src/index.css` (CSS global)
- Adicionar suporte a `--keyboard-inset-height` via classe utilitária e garantir `min-height: 100dvh` (dinâmico) em vez de `100vh` em containers principais para reagir corretamente ao teclado no iOS.

### 5. (Opcional) `src/pages/Comunidade.tsx`
- Trocar `min-h-screen` por `min-h-dvh` para usar a altura dinâmica da viewport, que encolhe quando o teclado abre.

## Detalhes técnicos
- `KeyboardResize.Native` redimensiona o WebView; `Body` redimensiona apenas o `<body>`. `Native` é o mais seguro para inputs no meio do feed.
- `100dvh` (dynamic viewport height) já é suportado no iOS Safari/WKWebView 15.4+.
- Após mudar `capacitor.config.ts`, o usuário precisa rodar `npx cap sync ios` localmente para aplicar (não afeta o preview web).

## Fora do escopo
- Não mexer em RLS, lógica de negócio ou outros componentes.
