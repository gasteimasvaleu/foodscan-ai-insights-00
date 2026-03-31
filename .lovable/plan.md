
Objetivo: implementar um seletor tipo “wheel picker” (roleta) no app, com aparência iOS, no fluxo de treino.

1) Definir escopo funcional (antes de codar)
- Confirmar em quais campos ele entra primeiro (ex.: `Séries`, `Repetições`, `Duração`).
- Definir comportamento esperado:
  - faixa de valores (ex.: 1–20 séries),
  - valor padrão,
  - se permite digitação manual ou só roleta.

2) Escolher abordagem técnica
- Opção recomendada (mais rápida): Wheel picker em React (web + Capacitor), usando:
  - lista com `scroll-snap`,
  - item central destacado,
  - feedback háptico opcional em iOS.
- Opção avançada (100% nativa iOS): plugin Capacitor com `UIPickerView`.
  - Mais trabalho e manutenção, só vale se você quiser comportamento nativo estrito.

3) Implementar componente reutilizável
- Criar componente `WheelPicker` com props:
  - `value`, `onChange`, `options`, `label`, `itemHeight`.
- Garantir acessibilidade:
  - navegação por teclado,
  - área de toque confortável,
  - contraste no item selecionado.

4) Integrar na tela alvo
- Substituir `Input`/`Select` atuais no `AddExerciseModal` (ou tela que você indicar) pelos wheels.
- Manter compatibilidade com estado atual do formulário (`sets`, `reps`, etc.).
- Preservar visual atual do app (cores/estilo já usados em `Treinos`/`WorkoutPlan`).

5) Ajustes para mobile (390x640)
- Validar altura da roleta e evitar overflow no modal.
- Garantir que o item selecionado fique sempre centralizado.
- Ajustar espaçamento para uso confortável com uma mão.

6) QA e validação
- Testar fluxo completo:
  - abrir modal,
  - selecionar valores na roleta,
  - salvar exercício,
  - conferir persistência no plano.
- Testar no iOS (Capacitor) e web para confirmar consistência.

Dependências/pré-requisitos
- Não precisa backend novo.
- Não precisa migration.
- Apenas componente de UI + integração no formulário.
- Se optar pela versão nativa iOS (`UIPickerView`), aí sim precisa plugin Capacitor adicional.

Estimativa
- Abordagem React (recomendada): baixa a média complexidade.
- Abordagem plugin nativo iOS: média a alta complexidade.
