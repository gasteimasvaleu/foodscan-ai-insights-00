# Correção de "assinatura emprestada" (RevenueCat)

## O que encontrei

| Item | Situação |
|---|---|
| 1. Restaurar compras automático | PROBLEMA. Ao entrar no app (e a cada renovação de sessão), a rotina de sincronização chama "restaurar compras" sozinha se não achar assinatura. Isso puxa a assinatura do ID Apple do aparelho para a conta que está logada. |
| 2. Ligar assinatura sem dono a quem entrou | PROBLEMA PARCIAL. Por transação: só liga se o código bater (ok). Por email: liga qualquer registro sem dono com o mesmo email, sem comparar a transação. A verificação de assinatura no servidor faz o mesmo. |
| 3. Entrar e sair no RevenueCat | OK. O login identifica o usuário no RevenueCat e a saída desconecta. |
| 4. Salvar só quando o RevenueCat confirma | PROBLEMA. Quem grava a assinatura é o próprio app, não o servidor. Além disso, as regras do banco deixam qualquer usuário logado criar um registro de assinatura e alterar o de QUALQUER pessoa. Ou seja, alguém mal-intencionado poderia se dar Pro. |
| 5. Limite grátis por conta no banco | PARCIAL. É contado no banco por conta, mas o usuário pode apagar e editar o próprio contador, zerando o limite. |

## No banco hoje

- Só 3 registros de assinatura. Nenhuma transação ligada a mais de uma conta, nenhum registro sem dono e nenhum email repetido. Não há assinatura emprestada no momento.
- Atenção: o Pro vitalício de admin@wediet.app foi sobrescrito. Hoje está como assinatura Apple até 01/11/2026, não mais até 2099. É exatamente o efeito do item 1/4: ao entrar no app, a sincronização regravou o registro.

## Plano de correção

1. Tirar o "restaurar compras" automático. Ele só roda pelo botão "Restaurar Compras".
2. Sincronizar só no evento de entrada (não a cada renovação de sessão).
3. Remover a ligação por email sem comparar transação, no app e na verificação do servidor.
4. Mover a gravação da assinatura para o servidor: o app só avisa "comprei/restaurei", e uma função do servidor pergunta ao RevenueCat se aquele usuário tem assinatura ativa e só então grava. Uma mesma transação não pode ficar ligada a duas contas (a nova vence só se o RevenueCat confirmar a transferência).
5. Não sobrescrever assinaturas manuais/vitalícias com dados da Apple.
6. Fechar as regras do banco: usuário só lê a própria assinatura; criar/alterar só pelo servidor. No contador de limite grátis, o usuário só lê; o aumento do contador passa a ser feito pelo servidor.
7. Restaurar o Pro vitalício de admin@wediet.app (até 2099).

## O que você faz no painel do RevenueCat

1. Project Settings → General → "Restore Behavior": trocar para **"Keep with original App User ID"**. Assim, quando alguém tocar em Restaurar em outra conta, a assinatura não sai da conta que pagou.
2. Project Settings → API Keys → criar uma **Secret API key** e me enviar (vou pedir num campo seguro). É com ela que o servidor confere se a assinatura é mesmo daquele usuário.
3. Conferir que o Webhook continua apontando para a nossa função e com o mesmo segredo de autorização (nada muda ali).

## Detalhes técnicos

- `src/lib/revenuecat.ts`: remover `restorePurchases` de `syncSubscriptionAfterLogin`; trocar upserts diretos por `supabase.functions.invoke('rc-sync')`.
- `AuthProvider.tsx`: sync só em `SIGNED_IN`.
- Nova edge function `rc-sync`: valida JWT, chama RevenueCat REST `GET /v1/subscribers/{user.id}` (precisa de secret `REVENUECAT_SECRET_API_KEY`), grava com service role; pula se `product_source='lifetime'` ou `payment_provider='manual'`.
- `revenuecat-webhook`: tratar `TRANSFER` (remove do antigo, dá ao novo) e não sobrescrever vitalícios.
- `check-subscription`: remover claim por email.
- Migration: `subscribers` drop `insert_subscription`/`update_own_subscription`, SELECT só `user_id = auth.uid()`; índice único parcial em `transaction_id`; `daily_usage_limits` remover INSERT/UPDATE/DELETE do usuário e incrementar via função `SECURITY DEFINER` chamada pelas edge functions de análise (que já usam a tabela).
- Testar: login em 2 contas no mesmo aparelho não herda Pro; botão Restaurar continua funcionando; usuário não consegue gravar em `subscribers`.
- Precisa de build nativo? Não, é tudo Live Update + servidor.
