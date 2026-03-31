
Objetivo: converter todos os campos restantes do card **Registrar Exercício** para o padrão de **painel inferior + Wheel Picker**, incluindo o botão rosa para intensidade.

1) Escopo confirmado
- Converter para Drawer + Wheel Picker:
  - **Duração (minutos)**
  - **Peso (kg)**
  - **Idade**
  - **Intensidade**
- Em **Intensidade**, usar botão rosa no padrão visual do app com texto:
  - **“Selecionar Intensidade”** (quando vazio)
  - valor escolhido após seleção

2) Estrutura de estado no `ExerciseForm`
- Adicionar estados de abertura por campo:
  - `isDurationDrawerOpen`, `isWeightDrawerOpen`, `isAgeDrawerOpen`, `isIntensityDrawerOpen`
- Adicionar estados temporários (“pending”) para confirmação:
  - `pendingDuration`, `pendingWeight`, `pendingAge`, `pendingIntensity`
- Manter `formData` como fonte final (só atualiza no **Confirmar**).

3) Substituição dos inputs atuais
- Trocar `<Input type="number">` de duração, peso e idade por botões acionadores (igual ao tipo de atividade) que abrem seus Drawers.
- Trocar o `RadioGroup` de intensidade por botão rosa:
  - classes no padrão primário (ex.: `bg-primary hover:bg-primary/90 text-white rounded-xl`).
- Em cada Drawer:
  - título do campo,
  - WheelPicker central,
  - ações **Cancelar** e **Confirmar** (mesmo padrão visual já aplicado).

4) Opções dos Wheels
- **Duração:** faixa prática (ex. 5–240 min, passo 5).
- **Peso:** faixa ampla com decimal (ex. 30.0–250.0, passo 0.5).
- **Idade:** faixa padrão (ex. 10–100).
- **Intensidade:** `Leve`, `Moderada`, `Intensa`.
- Conversões para submit:
  - armazenar string no `formData`,
  - `parseFloat/parseInt` continuam funcionando sem alterar backend.

5) Validação e UX
- Preservar validação obrigatória atual no envio.
- Garantir que “Cancelar” não altere valor.
- Ao abrir cada Drawer, iniciar wheel no valor atual (ou default).
- Manter estilo glassmorphism dos modais:
  - `bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl rounded-t-2xl`
- Ajustar altura e espaçamento para viewport **390x640** sem clipping.

6) Compatibilidade funcional
- Não alterar lógica de `handleSubmit` além de consumir os novos valores vindos dos Drawers.
- Manter integração com:
  - edge function `calculate-exercise-calories`
  - insert em `exercise_records` e `calorie_adjustments`.

Detalhes técnicos
- Arquivo principal: `src/components/ExerciseForm.tsx`.
- Reuso de padrão já existente no campo “Tipo de Atividade” para garantir consistência visual e comportamental.
- Sem mudanças em banco, migrations ou edge functions.
