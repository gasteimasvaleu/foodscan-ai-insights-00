# FitTracker: preencher peso e idade automaticamente

## Problema
Toda vez que você registra um exercício, o FitTracker pede peso e idade do zero. Depois de cada registro, a tela também apaga esses dois campos.

## O que muda
- Quando você abre o FitTracker, peso e idade já vêm preenchidos:
  - **Peso:** o mais recente entre a sua última Avaliação Física e o seu último exercício registrado.
  - **Idade:** a do seu último exercício registrado.
- Depois de registrar um exercício, a tela só limpa atividade, duração e intensidade. Peso e idade continuam preenchidos.
- Você continua podendo trocar os dois valores quando quiser, por exemplo se o seu peso mudou.
- No seu primeiro registro, como o app ainda não tem esses dados, a tela pede peso e idade normalmente.

## Detalhes técnicos
- `src/components/ExerciseForm.tsx`: ao montar, buscar o último `exercise_records` (weight, age, created_at) e a última `physical_assessments` com weight (assessment_date) do usuário. Preencher `formData.weight` com o valor mais recente e `formData.age` com a idade. No reset após salvar, manter `weight` e `age`.
- Sem mudança no banco. No iPhone, a mudança chega por um Live Update.
