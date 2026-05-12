## Implementação da aba Bebê

Estrutura espelhada nas demais (Tentantes/Gestação/Pós-parto): 1 Panel com sub-abas + componentes de registro persistidos no Supabase + JSON com conteúdo educativo (PT).

### Perfil do bebê (1 por usuário)

Tabela `baby_profile` (1 linha por usuário):
- `user_id` (PK), `name`, `birth_date`, `sex` (opcional), timestamps
- RLS: usuário só vê/edita o próprio
- Card de "Configurar bebê" no topo de cada sub-aba quando ainda não existir registro

### Sub-abas (4)

1. **Crescimento + Sono** (`GrowthSleep.tsx`)
   - Card de crescimento: dialog para registrar peso (kg) e altura (cm) numa data — lista das últimas 6 medições, último valor em destaque.
   - Card de sono: dialog para registrar sono (início/fim, tipo `soneca` ou `noturno`) — total do dia atual e últimos 7 dias em barras simples.

2. **Alimentação + Fraldas** (`FeedingDiapers.tsx`)
   - Registro rápido de mamadas: botões grandes (Peito esq./Peito dir./Mamadeira/Papinha) com horário, dialog para detalhes (duração ou ml).
   - Registro de fraldas: 3 botões (Xixi / Cocô / Mista), data/hora atual.
   - Resumo do dia: contagem por tipo.

3. **Vacinas & Marcos** (`VaccinesMilestones.tsx`)
   - Checklist de vacinas oficiais BR (calendário PNI 0-12m) carregado do JSON.
   - Checklist de marcos do desenvolvimento por faixa etária (sorri, segura cabeça, senta, engatinha, anda…).
   - Persistência por `item_key` + `checked_at`, barra de progresso.

4. **Conteúdo educativo** (`EducationalContent.tsx`)
   - 4-6 cards informativos do JSON (sono seguro, choro, introdução alimentar 6m, sinais de alerta, brincar e estimular).
   - `bg-white/70 backdrop-blur-md`, títulos `text-base` sem ícones.

### Tabelas Supabase (todas com RLS por user_id)

- `baby_profile` — `user_id` PK, `name`, `birth_date`, `sex`
- `baby_growth` — `id`, `user_id`, `recorded_at` (date), `weight_kg`, `height_cm`, `head_cm` (opcional), `notes`
- `baby_sleep` — `id`, `user_id`, `started_at`, `ended_at`, `kind` (soneca|noturno), `notes`
- `baby_feedings` — `id`, `user_id`, `fed_at`, `kind` (peito_esq|peito_dir|mamadeira|papinha), `amount_ml` (nullable), `duration_min` (nullable), `notes`
- `baby_diapers` — `id`, `user_id`, `changed_at`, `kind` (xixi|coco|mista), `notes`
- `baby_checklist` — `id`, `user_id`, `item_key`, `checked_at`, UNIQUE (user_id, item_key) — usado para vacinas + marcos

Índices em (user_id, recorded_at|started_at|fed_at|changed_at DESC). Trigger `update_updated_at_column()` em tabelas com `updated_at`.

### Arquivos novos

- `src/components/maternidade/bebe/BebePanel.tsx`
- `src/components/maternidade/bebe/BabyProfileCard.tsx` (configurar/editar bebê)
- `src/components/maternidade/bebe/GrowthSleep.tsx`
- `src/components/maternidade/bebe/FeedingDiapers.tsx`
- `src/components/maternidade/bebe/VaccinesMilestones.tsx`
- `src/components/maternidade/bebe/EducationalContent.tsx`
- `src/data/maternidade/bebe-pt.json` (vacinas PNI, marcos por idade, cards educativos)

### Integração

- `src/pages/Maternidade.tsx`: trocar `<ComingSoon label="Bebê & Sono" />` por `<BebePanel />`.
- Modais seguem padrão do app: `w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto`.
- Inputs `h-12 rounded-xl text-base`, labels `text-sm text-gray-700`, sufixos (kg, cm, ml, min) em wrapper flex.

### Fora do escopo

- Múltiplos bebês, gráficos avançados (curvas OMS), notificações, lembretes WhatsApp, IA, exportação.
