

## Implementar VideoOverlay fullscreen com progresso

### Vídeo
`https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/openart-video_172ff066_1774432172784.mp4`

### 1. Criar `src/components/VideoOverlay.tsx`
- Overlay `fixed inset-0 z-50` com fundo escuro semi-transparente
- Vídeo fullscreen em loop, muted, autoplay como background
- Texto centralizado sobre o vídeo: mensagem principal + submensagem
- Barra de progresso animada (indeterminada, oscilando)
- Fade in/out com framer-motion (`AnimatePresence`)
- Props: `isVisible: boolean`, `message: string`, `subMessage?: string`

### 2. Integrar em `src/pages/FoodScan.tsx`
- Importar `VideoOverlay`
- Renderizar: `<VideoOverlay isVisible={isAnalyzing || isDescribing} message="Analisando seu prato..." subMessage="Nossa IA está identificando os alimentos" />`

### 3. Integrar em `src/pages/MasterCheFIT.tsx`
- Importar `VideoOverlay`
- Renderizar: `<VideoOverlay isVisible={isGenerating} message="Criando seu cardápio..." subMessage="Preparando receitas personalizadas para você" />`

### 4. Integrar em `src/pages/DailyControl.tsx`
- Importar `VideoOverlay`
- Renderizar: `<VideoOverlay isVisible={isAnalyzing} message="Analisando seu dia..." subMessage="Calculando seus resultados nutricionais" />`

