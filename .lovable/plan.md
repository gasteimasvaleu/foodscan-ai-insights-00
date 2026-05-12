## Aba Tentantes — Maternidade

Implementar a aba "Tentantes" com 4 sub-seções acessíveis via sub-tabs (mesmo padrão visual de Gestação/Pós-parto).

### Estrutura de arquivos

```
src/components/maternidade/tentantes/
├── TentantesPanel.tsx         (sub-tabs: Ciclo · Fertilidade · Pré-concepção · Educativo)
├── CycleTracker.tsx           (registro de ciclo + histórico)
├── FertilityCalculator.tsx    (calculadora de janela fértil/ovulação)
├── PreconceptionChecklist.tsx (checklist editável)
└── EducationalContent.tsx     (cards informativos)

src/data/maternidade/tentantes-pt.json  (conteúdo educativo + checklist padrão)
```

E atualizar `src/pages/Maternidade.tsx` para renderizar `<TentantesPanel />` no lugar do `ComingSoon`.

### 1. Banco de dados (Supabase, com RLS)

**Tabela `menstrual_cycles`** — um registro por ciclo
- `user_id` uuid (RLS: auth.uid())
- `cycle_start_date` date — 1º dia da menstruação
- `cycle_length_days` int (default 28)
- `period_length_days` int (default 5)
- `flow` text — 'leve' | 'moderado' | 'intenso' (nullable)
- `mood` text (nullable)
- `symptoms` text[] (default '{}')
- `notes` text (nullable)

**Tabela `preconception_checklist`** — itens marcados pelo usuário
- `user_id` uuid (RLS)
- `item_key` text — chave do item (vem do JSON estático)
- `checked_at` timestamptz
- UNIQUE (user_id, item_key)

RLS: políticas padrão "users manage their own rows" (SELECT/INSERT/UPDATE/DELETE com `auth.uid() = user_id`). Trigger `update_updated_at_column` em `menstrual_cycles`.

### 2. CycleTracker

- Botão "Registrar novo ciclo" → Dialog (glassmorphism) com: data início (input date), duração ciclo (default da preferência ou 28), duração menstruação, fluxo, humor, sintomas (chips multi), notas.
- Lista dos últimos 6 ciclos em cards `bg-[#FFD1E7] rounded-2xl`: data, duração real (calculada do próximo ciclo) e badge de regularidade.
- Estatísticas no topo: duração média, regularidade (desvio padrão), próxima menstruação prevista.

### 3. FertilityCalculator

- Inputs: 1º dia da última menstruação + duração média (auto-preenche do último ciclo se existir).
- Cálculos client-side (sem IA):
  - Ovulação prevista = início + (duração − 14)
  - Janela fértil = ovulação − 5 dias até ovulação + 1
  - Próxima menstruação = início + duração
- Visualização: timeline horizontal com 3 chips (menstruação / fértil / ovulação / próxima menstruação) e datas formatadas em PT-BR.
- Aviso curto: "Estimativa baseada em ciclo regular. Não substitui acompanhamento médico."

### 4. PreconceptionChecklist

- 4 grupos no JSON: Exames, Suplementação, Hábitos, Consultas (cada item com `key`, `label`, `description`).
- Render: cards `bg-[#FFD1E7] rounded-2xl` por grupo, lista de itens com Checkbox.
- Toggle: insere/deleta linha em `preconception_checklist`. Otimista no UI.
- Barra de progresso no topo: X/Y concluídos.

### 5. EducationalContent

- Cards `bg-white/70 backdrop-blur-md` lendo do JSON:
  - "Dicas para aumentar a fertilidade"
  - "Alimentação que favorece a fertilidade"
  - "Primeiros sinais de gravidez"
  - "Quando procurar um especialista"
- Cada card: título `text-base` (sem ícone, sem emoji), conteúdo em `<ul>`.

### 6. Integração

- `Maternidade.tsx`: importar `TentantesPanel`, substituir `<ComingSoon label="Tentantes" />` por `<TentantesPanel />`.
- Sem alterar header, ordem de tabs ou estilo das tabs principais.

### Fora de escopo

- Multi-idioma (apenas PT por ora; estrutura JSON facilita futuro EN/ES).
- Notificações de janela fértil / lembretes (pode vir depois).
- Integração com WhatsApp ou IA.
- Migração de dados de localStorage existente.