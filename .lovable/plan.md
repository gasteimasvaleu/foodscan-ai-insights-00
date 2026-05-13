# Tela Fullscreen de Celebração

Adicionar uma tela cheia animada que aparece automaticamente quando o usuário:
1. **Desbloqueia uma conquista** (badge nova inserida em `user_badges`)
2. **Atinge um marco de streak** (3, 7, 14, 30, 60, 100 dias)

Hoje só mostramos um `toast` discreto — vamos transformar em um momento "wow" fullscreen.

## Componentes novos

### 1. `src/components/celebration/CelebrationOverlay.tsx`
Overlay fullscreen (`fixed inset-0 z-[100]`) com:
- Fundo glassmorphism escurecido (`bg-black/60 backdrop-blur-md`)
- Confetes animados (chuva de partículas usando `canvas-confetti` ou divs animadas com keyframes Tailwind)
- Card central rounded-3xl com:
  - Ícone grande (emoji do badge OR 🔥 para streak) com animação `scale-in` + `pulse`
  - Título grande em `text-primary` (#FD46A1): "Conquista Desbloqueada!" / "Sequência de X dias!"
  - Nome + descrição da conquista
  - Botão "Continuar" (#FD46A1) que fecha o overlay
- Anel de luz/glow gradiente girando atrás do ícone
- Auto-dismiss opcional após 6s
- Som leve opcional (deixar fora desta primeira versão)

Animações via classes existentes (`animate-fade-in`, `animate-scale-in`) + keyframes novos para confete (`confetti-fall`) e glow rotativo (`spin-slow`).

### 2. `src/contexts/CelebrationContext.tsx`
Context global para enfileirar celebrações (caso 2 disparem juntas):
- `triggerCelebration({ type: 'badge' | 'streak', icon, title, description })`
- Renderiza `<CelebrationOverlay />` no topo da árvore
- Fila FIFO — mostra uma de cada vez

Provider envolvido em `App.tsx` dentro do `AuthProvider`.

## Mudanças em arquivos existentes

### `src/hooks/useBadgeNotifications.ts`
- Trocar `toast.success(...)` por `triggerCelebration({ type: 'badge', icon, title, description })` do contexto.
- Manter o toast como fallback caso o overlay esteja desabilitado (não, vamos só usar o overlay).

### Novo hook: `src/hooks/useStreakMilestones.ts`
- Subscreve `postgres_changes` em `user_streaks` (UPDATE) para o `userId` atual.
- Quando `current_streak` cruza um marco (3, 7, 14, 30, 60, 100), dispara `triggerCelebration({ type: 'streak', icon: '🔥', title: 'Sequência de X dias!', description: 'Você está pegando fogo!' })`.
- Comparar com valor anterior (guarda em ref) para evitar disparar repetido.

### `src/App.tsx`
- Envolver árvore com `<CelebrationProvider>`.
- Chamar `useStreakMilestones(user?.id)` no mesmo lugar onde já chamamos `useBadgeNotifications`.

## Detalhes técnicos

- Sem dependências novas: confete feito com 30-50 `<div>` posicionados aleatoriamente + keyframe CSS (`translateY` + `rotate` + opacity). Definido em `index.css` ou `tailwind.config.ts`.
- Cores dos confetes: paleta da marca (#FD46A1, #FFD1E7, #F7FAFB, branco).
- Respeitar safe area (`pt-[env(safe-area-inset-top)]`, `pb-[env(safe-area-inset-bottom)]`) para iOS.
- Z-index acima da Navbar e modais (z-[100]).
- Acessibilidade: botão "Continuar" com foco automático, fecha no ESC e no clique fora.
- Se `prefers-reduced-motion`, simplificar (sem confete, só fade).

## Fluxo de teste

1. Registrar refeições por 3 dias seguidos → trigger atualiza streak para 3 → overlay 🔥 aparece.
2. Registrar 10 refeições no total → badge inserido → overlay com ícone do badge aparece.
3. Caso ambos disparem ao mesmo tempo, mostrar em sequência via fila do contexto.

Quer que eu inclua som, ou mantemos apenas visual nesta primeira versão?