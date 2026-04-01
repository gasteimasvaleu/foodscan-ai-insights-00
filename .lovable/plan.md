

## Página de Objetivos — Gamificação com Monitoramento Automático

### Conceito
Criar uma página `/objetivos` onde o usuário configura metas comportamentais (ex: "limitar lanches a 3x/semana") e o sistema monitora automaticamente usando dados já existentes em `meal_records`, `exercise_records` e `hydration_records`. Cada objetivo mostra progresso semanal e status (cumprido/não cumprido), criando um efeito de gamificação.

### Objetivos disponíveis e como monitorar

| Objetivo | Monitoramento | Dados usados |
|---|---|---|
| **Limitar lanches** | Contar registros com `meal_type = 'lanche'` na semana | `meal_records` |
| **Limitar fast food** | Contar refeições cujo `food_name` contenha palavras-chave (pizza, hambúrguer, etc.) | `meal_records` |
| **Limitar açúcar** | Contar refeições com palavras-chave doces (bolo, sorvete, chocolate, etc.) | `meal_records` |
| **Não comer em excesso** | Verificar se calorias diárias ficaram dentro da meta do `daily_goals` em X dias da semana | `meal_records` + `daily_goals` |
| **Alimentação saudável** | Contar dias em que proteínas/fibras atingiram a meta | `meal_records` + `daily_goals` |
| **Começar a se exercitar** | Contar registros de exercício na semana >= meta | `exercise_records` |
| **Reduzir carne** | Contar refeições com palavras-chave de carne | `meal_records` |
| **Origem do alimento** | Manual — o usuário marca quando cozinhou em casa | Novo campo ou check manual |

### Alterações

**1. Criar tabela `user_objectives` (migração SQL)**
```sql
CREATE TABLE user_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  objective_key text NOT NULL, -- ex: 'limit_snacks'
  target_value integer NOT NULL, -- ex: 3 (máximo por semana)
  target_unit text NOT NULL DEFAULT 'per_week', -- 'per_week' ou 'per_day'
  is_active boolean NOT NULL DEFAULT true,
  custom_keywords text[], -- palavras-chave personalizadas (opcional)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```
Com RLS para cada usuário ver/editar apenas seus objetivos.

**2. Criar página `src/pages/Objetivos.tsx`**
- Lista os objetivos ativos do usuário com cards visuais
- Cada card mostra: nome do objetivo, meta configurada, progresso atual da semana (ex: "2/3 lanches"), barra de progresso, e badge verde/vermelho
- Botão para adicionar novos objetivos (modal com lista dos tipos disponíveis + configuração do limite)
- A lógica de contagem consulta `meal_records` e `exercise_records` da semana corrente diretamente no frontend

**3. Criar componente `src/components/ObjectiveCard.tsx`**
- Card individual com ícone, título, progresso animado (estilo similar ao DailyGoals), e indicador de status
- Cor verde quando dentro da meta, vermelho quando ultrapassou

**4. Criar componente `src/components/AddObjectiveModal.tsx`**
- Modal para selecionar tipo de objetivo e configurar o limite (ex: "Lanches: máximo ___ vezes por semana")
- Cada tipo tem sugestões de palavras-chave pré-definidas que o usuário pode personalizar

**5. Criar hook `src/hooks/useObjectives.ts`**
- Gerencia CRUD dos objetivos e calcula progresso semanal
- Função `calculateProgress(objective)` que consulta as tabelas relevantes e retorna contagem atual vs meta

**6. Registrar rota em `src/App.tsx`**
- Adicionar `<Route path="/objetivos" element={<Objetivos />} />`

### Design visual
- Segue o padrão existente: fundo `bg-[#FFD1E7]`, cards `rounded-3xl`, cores rosa `#FD46A1`
- Barras de progresso animadas com Framer Motion (como em DailyGoals)
- Badges: 🟢 "Meta cumprida" / 🔴 "Meta ultrapassada"
- Ícones Lucide para cada tipo de objetivo (Apple, Dumbbell, Pizza, Cookie, etc.)

### Detalhes técnicos
- As palavras-chave de fast food/açúcar/carne são pré-definidas em português e buscadas via `ilike` ou filtro JS no array de `meal_records`
- O cálculo de progresso é feito no frontend para simplicidade (query das meals da semana já acontece no WeeklySummary)
- "Origem do alimento" pode usar um sistema de check diário simples (o usuário marca se cozinhou em casa)

