# Pro vitalício para admin@wediet.app

## O que encontrei
- A conta admin@wediet.app existe.
- Hoje o Pro dela está vencido (acabou em 01/06/2026, era assinatura mensal da Apple).
- O registro de assinatura atual está ligado a outro código de usuário (antigo), só coincide pelo email.

## O que vou fazer
1. Atualizar o registro de assinatura dessa conta para:
   - Pro ativo
   - Plano Premium
   - Válido até 31/12/2099 (na prática, vitalício)
   - Origem "manual / vitalício" (para não ser confundida com compra da Apple)
2. Ligar esse registro ao usuário correto da conta admin@wediet.app.
3. Conferir que a rotina diária que expira assinaturas não vai desativar (data muito à frente).
4. Entrar com a conta e confirmar que o app mostra o Pro liberado.

## Detalhes técnicos
- Upsert em `public.subscribers` com `user_id = 003f8e9f-e267-4dd4-99d4-bbc5291414c6`, `email`, `subscribed = true`, `subscription_status = 'active'`, `subscription_tier = 'Premium'`, `subscription_end = '2099-12-31'`, `payment_provider = 'manual'`, `product_source = 'lifetime'`.
- Verificar se `check-subscription` / webhook do RevenueCat sobrescrevem registros com `payment_provider = 'manual'`; se sim, ajustar para respeitar o vitalício.
