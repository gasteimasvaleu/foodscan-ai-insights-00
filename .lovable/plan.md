
Objetivo: testar o Wheel Picker no campo **“Tipo de Atividade”** do card **Registrar Exercício** em `/fit-tracker`, abrindo em **painel inferior** (Drawer).

1) Mapear integração no formulário
- Alterar `src/components/ExerciseForm.tsx` no bloco de `activityType`.
- Substituir o `Select` atual por um campo acionador (botão/input read-only) que mostra o valor selecionado e abre o painel.

2) Reutilizar componentes existentes
- Usar `Drawer` de `src/components/ui/drawer.tsx`.
- Usar `WheelPicker` de `src/components/ui/wheel-picker.tsx` com `ACTIVITY_TYPES` como opções.
- Manter `formData.activityType` como fonte única de verdade para o submit atual.

3) Fluxo de seleção no painel inferior
- Ao abrir: iniciar Wheel com valor atual (ou primeiro item se vazio).
- Dentro do Drawer: título “Tipo de Atividade”, Wheel central, ações **Cancelar** e **Confirmar**.
- `Cancelar`: fecha sem alterar `formData.activityType`.
- `Confirmar`: aplica valor escolhido em `formData.activityType` e fecha.

4) Ajustes de UX mobile (390x640)
- Definir altura confortável do painel (sem cobrir tudo).
- Garantir área de toque adequada e rolagem suave no Wheel.
- Preservar visual do app (glass/pink style já usado no projeto).

5) Compatibilidade e validação funcional
- Continuar exigindo `activityType` como obrigatório no envio.
- Garantir que `handleSubmit` continue enviando `activityType` corretamente para a Edge Function e para `exercise_records`.
- Validar fluxo: abrir card Registrar → tocar Tipo de Atividade → selecionar no Wheel → confirmar → enviar formulário com sucesso.

Detalhes técnicos
- Arquivo principal: `src/components/ExerciseForm.tsx`.
- Componentes reutilizados: `Drawer`, `WheelPicker`, `Button`, `Label`.
- Estado recomendado:
  - `isActivityDrawerOpen` (boolean)
  - `pendingActivityType` (string temporária do Wheel)
- Sem necessidade de backend/migration; mudança apenas de UI/estado local.
