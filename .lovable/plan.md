# Reformular Quick Actions na home + mover ações ao menu "+"

## Objetivo
1. Reduzir o deck de QuickActions para 3 cards (Escanear Comida, Registrar Exercício, WhatsApp).
2. Adicionar acima do deck uma linha hero com 2 cards: thumb 16:9 do último vídeo de treinos + card 4:5 com passos do Apple Health.
3. Mover **Treinos** e **Gerar Cardápio (MasterCheFIT)** para o menu "+" inferior.

## Layout da home

```text
┌──────────────────────────┬──────────┐
│  Thumb 16:9 último vídeo │  4:5     │
│  ─────────────────────   │  Passos  │
│  Título + "Ver treinos"  │  Apple   │
│                          │  Health  │
└──────────────────────────┴──────────┘
┌─────────────────────────────────────┐
│  Escanear Comida                    │
├─────────────────────────────────────┤
│  Registrar Exercício                │
├─────────────────────────────────────┤
│  WhatsApp                           │
└─────────────────────────────────────┘
```

- Linha superior em `grid-cols-[1.6fr_1fr] gap-3 items-stretch`. Coluna 4:5 dita a altura; coluna esquerda estica para a mesma altura, mantendo a thumb em `aspect-[16/9]` no topo e título + chevron embaixo.
- Card esquerdo é todo clicável → navega para `/treinos`.
- Card direito (4:5):
  - Apple Health conectado → mostra `Footprints`, número grande de passos do dia em `text-3xl font-bold text-[#FD46A1]` e label "Passos hoje". Clique vai para `/fit-tracker`.
  - Não conectado / não suportado → CTA "Conectar Apple Health" levando a `/fit-tracker`.
- Estilo dos cards segue o padrão pink (#FFD1E7 bg, rounded-3xl), título `text-base` sem ícone decorativo.

## Menu "+" (tubelight-navbar moreSheetItems)
Adicionar dois novos itens, mantendo a ordem temática existente:
- **Treinos** — descrição "Vídeos de treino e dicas em casa", ícone `Dumbbell`, url `/treinos`.
- **Gerar Cardápio** — descrição "Cardápios personalizados com IA (MasterCheFIT)", ícone `ChefHat` (ou `UtensilsCrossed` para diferenciar de "Faça em Casa"), url `/masterchef`.

## Arquivos
- `src/components/QuickActions.tsx` — remover entries de Treinos e Gerar Cardápio; manter animação stagger e gating Pro.
- `src/components/HeroDeckRow.tsx` (novo) — renderiza `LatestWorkoutCard` + `StepsCard`.
  - `LatestWorkoutCard`: `supabase.from('workout_content').select('id,title,thumbnail_url').order('created_at',{ascending:false}).limit(1).maybeSingle()`. Fallback: gradiente rosa + ícone `Dumbbell` se thumbnail ausente.
  - `StepsCard`: usa `useHealthKit()` (`isSupported`, `isConnected`, `dailySteps`). Clique sempre navega para `/fit-tracker` (não dispara prompt de permissão fora de contexto).
- `src/pages/Index.tsx` — inserir `<HeroDeckRow />` antes de `<QuickActions />`.
- `src/components/ui/tubelight-navbar.tsx` — adicionar os 2 novos `moreSheetItems` e importar os ícones.

## Fora de escopo
- Não mexer em gating Pro nem nas rotas `/treinos`, `/masterchef`, `/fit-tracker`.
- Sem mudanças de banco.