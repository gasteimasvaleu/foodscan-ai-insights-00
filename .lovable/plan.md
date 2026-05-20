## Liquid Glass na TubelightNavbar (otimizado para iOS nativo)

Trazer o efeito "bolha de água" do iOS 26 para a navbar inferior, mantendo performance dentro do WebView do Capacitor em iPhone.

### Estratégia em camadas (do mais leve ao mais pesado)

A navbar vai ganhar **3 níveis de efeito**, ativados conforme a capacidade do dispositivo:

1. **Base (sempre ativo)** — o que já existe + reforço:
   - `backdrop-blur-2xl` (sobe de `backdrop-blur-lg`).
   - `bg-white/15` no lugar do `bg-[#FA1690]/85` sólido — o rosa vira apenas um tint sutil para não perder identidade (`bg-[#FA1690]/30`).
   - `box-shadow` inset branco nas bordas (highlight de borda de vidro):
     `inset 1.5px 1.5px 0.5px rgba(255,255,255,0.6), inset -1px -1px 0.5px rgba(255,255,255,0.4)`.
   - Sombra externa dupla para "flutuar": `0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.1)`.

2. **Highlight especular (sempre ativo, CSS puro)**:
   - Um `::before` com `background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 40%)` na metade superior — simula o reflexo de luz da gota d'água.
   - Custo zero de GPU.

3. **Refração real (SVG `feDisplacementMap`) — só em iOS nativo**:
   - Filter SVG `<filter id="liquid-glass">` com `feTurbulence` + `feDisplacementMap scale=40` (bem mais baixo que o exemplo do Glass Dock que usava 200 — pra não dar jank no WebView).
   - Aplicado via `filter: url(#liquid-glass)` numa camada absoluta atrás do conteúdo da pill.
   - **Ativação condicional**: só renderiza se `useNativePlatform().isIOS === true`. Em Android/Web, pula direto pra camada 2 (base + highlight) — mais leve.

### Interações "squish" (responde ao toque)

- Ao tocar num item (`onTouchStart` / `active:`):
  - O item ganha `scale-110` com easing spring `cubic-bezier(0.175, 0.885, 0.32, 2.2)` e `duration-500`.
  - O container inteiro da pill ganha um leve `scale-[1.02]` por 200ms (efeito "bolha empurrada").
- Trocar a transição atual do "lamp" (`spring 300/30`) por uma curva mais "água" (`stiffness 220, damping 22`).

### Auto-hide on scroll (igual iOS 26)

- Hook novo `useScrollDirection()` simples: detecta scroll down → navbar desce 80% (`translate-y-[60%]` com opacity `0.85`), scroll up → volta (`translate-y-0`).
- Threshold de 8px pra não tremer.
- Transição `duration-300 ease-out`.
- Opcional (atrás de flag): pode ficar desligado por padrão se você quiser ver antes — me diz na hora de implementar.

### Cor e identidade

- Mantém a vibe rosa do We Diet, mas como **tint translúcido** em vez de fundo opaco — assim o "vidro" aparece de verdade. O conteúdo da página atrás vai vazar com leve coloração rosa.
- O indicador "lamp" branco em cima do item ativo continua igual (já é a assinatura do app).

### Arquivos

- **Editar** `src/components/ui/tubelight-navbar.tsx`:
  - Importar `useNativePlatform`.
  - Trocar classes do container da pill (background, shadow, blur).
  - Adicionar `<LiquidGlassFilter />` condicional (renderiza só em iOS).
  - Adicionar camada `::before` via classe utilitária para o highlight.
  - Trocar easing dos `motion.div` do indicador.
  - Adicionar `active:scale-110` e easing spring nos items.

- **Criar** `src/components/ui/liquid-glass-filter.tsx`:
  - SVG `<filter id="liquid-glass">` isolado, renderiza uma única vez.
  - `display: none` no `<svg>` para não ocupar espaço.

- **(Opcional)** `src/hooks/useScrollDirection.ts` — só se você quiser o auto-hide na mesma leva.

### Cuidados / riscos

- **Performance em iPhone antigo (SE 1ª gen, 6S)**: o `feDisplacementMap` pode dar 30-40fps mesmo com scale=40. Mitigação: se virar problema, adicionamos detecção via `navigator.hardwareConcurrency < 4` pra desligar a camada 3.
- **Contraste de leitura**: com fundo mais transparente, ícones brancos sobre conteúdo claro (cards rosa claros do dashboard) podem perder contraste. Para garantir, mantemos `bg-[#FA1690]/30` como tint (não chega a sumir o rosa).
- **`overflow-x: hidden` no body** (constraint atual do app): o filter SVG não muda isso, ok.
- **Não tocar** no `Sheet` do "Mais" — só a barra inferior muda.

### Fora de escopo

- Não mexer na `Navbar` superior nem no `MFHeader`.
- Não trocar a estrutura de itens nem a lógica de rotas/Sheet.
- Não adicionar libs novas — tudo CSS + SVG inline.
