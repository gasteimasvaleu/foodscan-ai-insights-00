

## Página de Jejum Intermitente — Visual padrão do site

### O que será criado
Uma página completa de Jejum Intermitente (`/jejum`) seguindo o visual padrão do app: cabeçalho gradiente rosa com ícone + título, e cards com `rounded-3xl border-primary/20 bg-primary/10 shadow-xl`.

### Estrutura da página

1. **Cabeçalho** — Mesmo padrão das outras páginas:
   - `bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30` com ícone (Timer/Clock) e título "Jejum Intermitente"

2. **Card: Timer de Jejum**
   - Seletor de protocolo (16:8, 18:6, 20:4, OMAD, personalizado)
   - Anel circular SVG grande com contagem regressiva (horas:minutos:segundos)
   - Estado visual distinto: "Em jejum" (roxo/primary) vs "Janela alimentar" (verde)
   - Botão Iniciar / Finalizar jejum

3. **Card: Histórico da Semana**
   - Mini cards por dia mostrando duração do jejum e se atingiu a meta
   - Visual similar ao gráfico semanal da Hidratação

4. **Card: Estatísticas**
   - Streak atual, média de horas, maior jejum completado

### Banco de dados (migração)
- Tabela `fasting_records`: `id`, `user_id`, `started_at`, `ended_at` (nullable), `target_hours`, `protocol`, `created_at`
- RLS: usuário acessa apenas seus registros

### Arquivos
- **Migração SQL** — Criar tabela `fasting_records`
- **Criar**: `src/pages/IntermittentFasting.tsx`
- **Editar**: `src/App.tsx` — Rota `/jejum`
- **Editar**: `src/components/QuickActions.tsx` — Ação rápida para Jejum (se houver espaço)

### Detalhes técnicos
- Layout: `pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-40` + `container mx-auto px-4 py-8 space-y-4`
- Cards: `Card className="rounded-3xl border-primary/20 bg-primary/10 shadow-xl"`
- Timer atualiza a cada segundo via `setInterval` enquanto jejum está ativo
- Persiste `started_at` no Supabase ao iniciar; grava `ended_at` ao finalizar
- Se o usuário reabrir a página com jejum ativo, recalcula o tempo decorrido

