
## Corrigir de forma segura o NutriCoach sem piorar o resto da tela

### Diagnóstico
O problema piorou por dois motivos visíveis no código atual:

1. **O espaçamento da página foi quebrado**
   - `src/pages/NutriCoach.tsx` usa `pt-20`, enquanto o resto do app autenticado usa o padrão com safe area:
   - `pt-[calc(env(safe-area-inset-top)+2.5rem)]`
   - Por isso o título ficou colado na navbar.

2. **O chat está sendo forçado em cima de um Dialog desktop**
   - `src/components/ui/dialog.tsx` continua centralizado com `left-[50%]`, `top-[50%]`, `translate-x/y`.
   - Em `NutriCoach.tsx`, o modal recebe muitos overrides agressivos (`!top-20`, `!left-4`, `!right-4`, `!translate-x-0`, etc.).
   - Essa mistura é frágil no iOS/native e explica o “estouro”.

### O que vou fazer
#### 1. Restaurar o layout correto da página
**Arquivo:** `src/pages/NutriCoach.tsx`

- Trocar o container principal para o mesmo padrão das outras páginas autenticadas:
  - `pt-[calc(env(safe-area-inset-top)+2.5rem)]`
  - `pb-28`
- Isso corrige o cabeçalho colado na navbar e volta o respiro visual normal da página.

#### 2. Parar de usar o `DialogContent` como sheet improvisado
**Arquivo:** `src/pages/NutriCoach.tsx`

- Remover a estratégia atual de modal “forçado” com posicionamento fixo no topo.
- Substituir por um layout de chat mobile mais simples e previsível:
  - overlay escuro
  - painel próprio do NutriCoach
  - largura limitada ao viewport
  - altura menor
  - ancoragem estável sem depender do `DialogContent` desktop

Objetivo:
- eliminar conflito com transform/position herdados do Dialog
- impedir novo overflow horizontal

#### 3. Deixar o chat realmente afastado do teclado
**Arquivo:** `src/pages/NutriCoach.tsx`

No painel do chat:
- posicionar abaixo da navbar, perto do topo
- usar altura mais conservadora
- deixar bastante área livre embaixo para o teclado
- manter scroll só dentro da lista de mensagens

Em termos práticos:
- topo com safe area + navbar
- altura menor que a atual
- sem encostar no rodapé nem disputar espaço com teclado/tab bar

#### 4. Blindar a largura interna do chat
**Arquivo:** `src/pages/NutriCoach.tsx`

Aplicar contenção real nos elementos internos:
- wrappers com `min-w-0`
- mensagens com `break-words`
- markdown com quebra segura
- linha do input com `min-w-0`
- textarea sem chance de expandir o container

#### 5. Preservar as proteções globais que fazem sentido
**Arquivos:** `src/App.css`, `src/index.css`, `src/components/ui/tubelight-navbar.tsx`

Não vou mexer de novo no espaçamento global da página além do necessário.
Só manter o que ajuda de fato:
- `overflow-x: hidden` global
- navbar inferior sem bleed lateral

### Resultado esperado
- título do NutriCoach volta a ficar corretamente abaixo da navbar
- a tela principal para de parecer “quebrada”
- o chat abre como um painel estável perto do topo
- o teclado não encosta no chat
- o app nativo não ganha scroll lateral

### Detalhes técnicos
```text
A correção agora será:
1. restaurar o padding-top padrão da página
2. abandonar o Dialog desktop-overridden para esse caso
3. renderizar um painel de chat próprio, mobile-first
4. conter largura de mensagens/input internamente
5. manter apenas as travas globais úteis contra overflow
```
