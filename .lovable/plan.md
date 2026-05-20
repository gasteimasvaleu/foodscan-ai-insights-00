## Trocar vídeo do VideoOverlay pelo AnimatedSpinner

O componente `VideoOverlay` é a única peça oficial de "loading com texto" no app — já usado em **FoodScan, MasterCheFIT, Provador, DailyControl**. Trocar **dentro dele** o vídeo MP4 pelo spinner conic-gradient resolve as 4 telas de uma vez sem mexer em nenhuma `page`.

### 1. Adaptar o spinner para Vite/React

O código original usa `<style jsx>` (Next.js) — não funciona em Vite. Vou portar pra CSS regular:

- **Criar** `src/components/ui/animated-spinner.tsx` (Tailwind + classe CSS).
- **Adicionar** as `@property` e `@keyframes` em `src/index.css` (uma única vez, escopadas em `.animated-spinner`).
- Props: `size?: string` (default `10rem`), `className?: string`.
- Cores ajustadas pra paleta We Diet: rosa primário `#FD46A1`, accent `#FA1690`, complementar suave `#FFD1E7` — em vez do amarelo/roxo/azul do exemplo. O `drop-shadow` fica rosa também.

> Nota: `@property` tem suporte ~92% (Safari 16.4+, iOS 16.4+). Em browsers antigos o spinner ainda gira, só não anima o conic — fallback aceitável.

### 2. Substituir o vídeo dentro do VideoOverlay

Em `src/components/VideoOverlay.tsx`:
- Remover a `<video>` e seu `src` MP4.
- Trocar o fundo `bg-black/60` por um fundo mais coeso com o app: **gradient rosa escuro com leve blur**:
  `bg-gradient-to-br from-[#1a0a14]/95 via-[#FA1690]/30 to-[#1a0a14]/95 backdrop-blur-xl`.
- Inserir `<AnimatedSpinner size="9rem" />` acima do `message`.
- Manter o `message`, o `subMessage` opcional e a progress bar (não duplicam — o spinner é o foco visual e a barra dá noção de movimento).
- Manter `AnimatePresence`, z-index 60 e fade-in.

### 3. Onde mais aplicar (mesmo padrão, mesma API)

O `VideoOverlay` já cobre os principais casos de IA. Vou estender pra outras telas com loading longo de IA/rede onde hoje só existe spinner inline ou nada:

| Tela | Quando aparece | Mensagem |
|---|---|---|
| `Faca em Casa` (`/faca-em-casa`) | Identifying dish + gerar receita | "Identificando o prato..." → "Gerando receita..." |
| `Nutricionista que Vende` (`/nutricionista-que-vende`) | Gerar imagem + legenda | "Criando seu post..." |
| `Provador` (já tem) | confirmar |
| `Quiz` geração | Quando IA monta perguntas | "Preparando seu quiz..." |
| `AI Goals Assistant` (`DailyControl`) | Cálculo de metas | "Calculando suas metas..." |
| `NutriCoach` envio | **NÃO** — chat já mostra digitação inline, overlay seria intrusivo |

Para cada uma das telas acima:
- Importar `VideoOverlay`.
- Controlar com o `isLoading` que já existe.
- Passar mensagem específica.

### 4. Renomear (opcional — recomendo)

`VideoOverlay` não tem mais vídeo. Sugiro:
- Renomear o arquivo/export para `LoadingOverlay`.
- Manter um re-export de `VideoOverlay` pra não quebrar imports existentes em uma única leva.

> Se preferir manter o nome `VideoOverlay` por simplicidade, podemos pular este passo — me diz.

### Arquivos

- **Criar** `src/components/ui/animated-spinner.tsx`
- **Editar** `src/index.css` — adicionar `@property` + `@keyframes` + classe `.animated-spinner`
- **Editar** `src/components/VideoOverlay.tsx` — remover vídeo, plugar spinner, ajustar background
- **Editar** `src/pages/FacaEmCasa.tsx`, `src/pages/NutricionistaQueVende.tsx`, `src/pages/Quiz.tsx`, `src/pages/DailyControl.tsx` (no fluxo de AI Goals) — adicionar `<VideoOverlay isVisible={loading} message="..." />`
- **(Opcional)** renomear export para `LoadingOverlay` com re-export legado

### Cuidados

- Não tocar nos loaders "estilo skeleton" das listas (esses ficam inline, não viram overlay fullscreen).
- Não usar overlay em ações curtas (<800ms) — o flash é pior que esperar.
- Não usar no chat do NutriCoach (digitação inline é melhor UX).

### Fora de escopo

- Não mexer no Splash screen (já tem o `loader-15` que adicionamos).
- Não mexer nos botões inline com seus próprios spinners menores.
