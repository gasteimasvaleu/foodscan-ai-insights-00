
Objetivo: alinhar o Drawer do campo “Tipo de Atividade” (em `/fit-tracker`) ao mesmo padrão visual dos modais do app.

Plano de implementação
1) Ajustar apenas o Drawer desse fluxo (sem alterar o componente global):
- Arquivo: `src/components/ExerciseForm.tsx`
- No `DrawerContent` do seletor de atividade, aplicar classes do padrão de modal:
  - `bg-white/70`
  - `backdrop-blur-md`
  - `border-2 border-primary`
  - `shadow-xl`
  - `rounded-t-2xl` (mantendo comportamento de sheet inferior)

2) Harmonizar elementos internos com o padrão existente:
- Garantir que header/título/botões mantenham contraste e legibilidade sobre fundo translúcido.
- Ajustar (se necessário) o fundo do WheelPicker/container interno para combinar com o visual glassmorphism sem perder leitura.

3) Preservar comportamento atual:
- Não mudar lógica de abertura/fechamento.
- Manter fluxo `Cancelar`/`Confirmar` e atualização de `activityType` exatamente como está.

4) Validação visual e funcional no viewport atual (390x640):
- Abrir “Tipo de Atividade” e confirmar que o Drawer segue o mesmo estilo dos modais.
- Verificar se não há overflow, clipping, ou perda de contraste no texto/controles.
- Confirmar que seleção + submit continuam funcionando normalmente.

Detalhes técnicos
- Escopo intencionalmente local (`ExerciseForm`) para evitar regressão em outros Drawers da aplicação.
- Se o resultado ficar muito diferente do `Dialog`, posso fazer um segundo ajuste fino de opacidade/borda para ficar idêntico ao padrão salvo de modais.
