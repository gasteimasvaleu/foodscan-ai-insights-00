

## Assistente IA para Metas Diárias — Questionário Completo (12 Steps)

### Posicionamento do Botão
O botão "✨ Assistente IA" ficará **abaixo** do botão "Configurar Metas" (quando sem metas) e **abaixo** do botão "Editar Metas" (quando já tem metas), com a mesma largura horizontal.

### Steps do Questionário

1. **Boas-vindas** — Tela introdutória com animação
2. **Sexo** — Masculino / Feminino (cards grandes)
3. **Idade** — Input numérico
4. **Peso atual (kg)** — Input numérico
5. **Altura (cm)** — Input numérico
6. **Nível de atividade** — Sedentário / Leve / Moderado / Intenso / Muito intenso
7. **Objetivo principal** — Perder peso / Manter peso / Ganhar massa
8. **Evento/motivação especial** — Casamento, férias, formatura, competição, nenhum + data opcional (pulável)
9. **Restrições e saúde** — Multi-select: diabético, hipertenso, intolerância lactose, celíaco, vegano, vegetariano, alergias + campo livre (pulável)
10. **Rotina e estilo de vida** — Tipo de trabalho, horas de sono, estresse (1-5), refeições por dia (pulável)
11. **Histórico de dietas** — Já fez dieta? Tipo? Rebote? Peso mais baixo/alto (pulável)
12. **Resultado da IA** — Metas calculadas + explicação personalizada + botão "Aplicar Metas"

### Arquivos

**Novo**: `src/components/AIGoalsWizard.tsx`
- Modal fullscreen (Drawer mobile / Dialog desktop)
- Glassmorphism (`bg-white/70 backdrop-blur-md border-2 border-primary`)
- Barra de progresso, transições framer-motion, navegação Voltar/Próximo
- Steps 8-11 com botão "Pular"
- Step 12: chama edge function, loading animado, resultado com "Aplicar Metas"

**Novo**: `supabase/functions/ai-goals-calculator/index.ts`
- Lovable AI Gateway (`google/gemini-3-flash-preview`) com tool calling
- Calcula TMB + macros considerando evento, restrições, rotina, histórico
- Retorna `{ calories, carbohydrates, proteins, fats, diet_objective, explanation }`

**Alterado**: `src/pages/DailyControl.tsx`
- Sem metas: botão "✨ Assistente IA" abaixo de "Configurar Metas", mesma largura
- Com metas: botão "✨ Assistente IA" abaixo de "Editar Metas" no DailyGoals, mesma largura
- Callback `onApplyGoals` salva metas no banco

**Alterado**: `supabase/config.toml` — registrar `ai-goals-calculator`

