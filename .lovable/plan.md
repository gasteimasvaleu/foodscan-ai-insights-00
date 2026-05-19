## Problema

As interações **Paquera** (`flirt`), **Convidar pra mesa** (`sit_table`) e **Pagar sua conta** (`pay_bill`) falham silenciosamente porque o `CHECK constraint` da tabela `venue_interactions` só aceita os tipos antigos: `poke`, `drink`, `found_you`. Qualquer insert com os tipos novos é rejeitado pelo Postgres com erro de check constraint.

Apenas **Oferecer drink** funciona hoje porque `drink` está na lista permitida.

## Correção

### 1. Migration: ampliar o CHECK
```sql
ALTER TABLE public.venue_interactions DROP CONSTRAINT venue_interactions_type_check;
ALTER TABLE public.venue_interactions ADD CONSTRAINT venue_interactions_type_check
  CHECK (type = ANY (ARRAY['poke','drink','found_you','flirt','sit_table','pay_bill']));
```
Mantemos os tipos antigos para não invalidar registros existentes.

### 2. Sem mudanças de código
O frontend (`ToAquiChat.tsx` e `ToAquiActivity.tsx`) já envia/lê os tipos corretos. Nada além da migration é necessário.

## Verificação
Após aplicar, testar cada botão (Paquera, Mesa, Conta, Drink) no chat do venue e confirmar que aparecem em `/to-aqui/venue/:id/atividade`.
