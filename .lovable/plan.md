
Objetivo: corrigir o campo **Data** no modal de `/profile/assessment` para que ele não invada/encoste no campo **Peso (kg)** no viewport mobile (390x640), mantendo o layout visual limpo.

1) Diagnóstico do problema (fonte real)
- O input selecionado é estático em `src/pages/PhysicalAssessment.tsx` (linha do `<Input type="date" />`).
- Ele está dentro de um grid fixo `grid-cols-2 gap-4`, que no modal estreito gera pouco espaço por coluna.
- Em alguns navegadores mobile, o ícone nativo do calendário aumenta a largura útil do `type="date"` e causa “vazamento” visual no lado direito.

2) Ajuste principal (responsivo, sem regressão)
- No bloco dos campos do formulário, trocar:
  - de `grid grid-cols-2 gap-4`
  - para `grid grid-cols-1 sm:grid-cols-2 gap-4`
- Resultado: no mobile os campos ficam em 1 coluna (evita colisão entre Data e Peso), e em telas maiores volta para 2 colunas.

3) Ajuste fino específico do campo Data
- Adicionar classe específica no input de data para controlar melhor o espaço do ícone nativo (padding à direita e largura interna consistente), por exemplo:
  - `className="w-full pr-2"` + utilitário para indicador webkit se necessário.
- Se ainda houver deslocamento em iOS/Safari, aplicar classe utilitária focada em `::-webkit-calendar-picker-indicator` para reduzir offset horizontal sem alterar os outros inputs.

4) Garantia de consistência visual
- Manter o mesmo componente `Input` global (`src/components/ui/input.tsx`) sem alteração estrutural ampla, para não impactar outros formulários.
- Fazer ajuste local no `PhysicalAssessment.tsx` (layout + classe do campo Data) para mudança segura e isolada.

5) Validação funcional planejada
- Verificar no modal em 390x640:
  - campo Data alinhado e sem sobrepor o campo ao lado;
  - abertura do calendário funcionando normalmente;
  - sem quebra dos demais campos (altura, espaçamento, scroll).
- Verificar também em desktop/tablet que o grid 2 colunas continua correto.
