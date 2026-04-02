

## Corrigir espaçamento entre WhatsAppNotice e Metas Atuais na página Profile

### Problema
O card de aviso do WhatsApp está colado no card "Metas Atuais" — falta margem entre eles.

### Solução em `src/pages/Profile.tsx`

Adicionar `className="mt-4 mb-6"` ao componente `<WhatsAppNotice>` (linha ~230) para criar espaçamento adequado acima e abaixo dele, separando-o do `RemindersCard` acima e do card "Metas Atuais" abaixo.

