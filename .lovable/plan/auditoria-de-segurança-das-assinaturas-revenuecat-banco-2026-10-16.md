# Auditoria de segurança das assinaturas (RevenueCat + banco)

Boa parte disso já foi corrigida mais cedo hoje. Abaixo, como está agora.

## Relatório

| # | Pergunta | Situação |
|---|---|---|
| 1 | Restaurar compras automático no login/abertura | OK. Só roda pelos botões "Restaurar Compras" (Paywall e cartão de login). O login só pede ao servidor para conferir. |
| 2 | App decide Premium lendo o RevenueCat do celular | PARCIAL. Na compra e no restaurar, o app lê o RevenueCat do aparelho e já libera o Pro na hora ("forçar ativo") por 60s, antes do servidor confirmar. O servidor grava depois. Se o servidor disser "não", o Pro local some na próxima checagem, mas existe uma janela em que o celular decide. |
| 3 | Atribuir assinatura órfã/por e-mail a quem entrou | OK no app e no servidor. Ressalva: o webhook ainda CRIA registros órfãos (sem dono) para compras anônimas. Ninguém os liga a contas hoje, mas são lixo e risco futuro. |
| 4 | Regras do banco deixam o usuário gravar a própria assinatura | OK. Usuário só lê a própria; criar/alterar só admin ou servidor. |
| 5 | Função do servidor que confere no RevenueCat e é a única que grava | OK para iOS (função de sincronização + webhook, com chave secreta). Não existe app Android neste projeto, então não há chave Android. Ressalva: a tela antiga "Assinatura Necessária" ainda decide sozinha após a compra e recarrega a página. |
| 6 | Webhook sobrescreve VIP/manual ou junta contas pela transação | VIP/manual/vitalício protegidos na atualização. Transferência desliga a conta antiga. Ressalva: em compra anônima, o webhook busca registro existente pelo número da transação e o ATUALIZA, mesmo que pertença a uma conta real. |
| 7 | Limite grátis contado no banco, sem o usuário alterar | OK. Contado pelo servidor nas funções do FoodScan; usuário só lê o contador. |
| 8 | Número de versão visível no app | NÃO EXISTE. Não há como confirmar se o Live Update chegou. |
| 9 | Banco: transação compartilhada / ativas sem dono | Nenhuma. Só existe 1 registro de assinatura (admin@wediet.app, vitalício manual até 2099). Nada para limpar. |

## Plano de correção

1. Premium decidido só pelo servidor: após comprar/restaurar, o app chama o servidor e só libera o Pro com a resposta dele (sem "forçar ativo" pelo celular). Mostra "Confirmando assinatura..." enquanto espera.
2. Tela antiga "Assinatura Necessária": mesmo fluxo, sem recarregar a página.
3. Webhook: parar de criar registros órfãos para compras anônimas (só registra no log). Nunca atualizar por número de transação um registro de outra conta.
4. Versão visível: mostrar "Versão 1.1.0 (24) · web <data do build>" no rodapé do Perfil. A data muda a cada Live Update, provando que chegou.
5. Limpeza: nada a limpar hoje; deixo uma checagem pronta para o admin.

## Lembrete no RevenueCat

- Project Settings → General → **Restore Behavior = "Keep with original App User ID"**. Neste app só existe o projeto iOS; se um dia criar o Android, configure lá também.

## Detalhes técnicos

- `PaywallScreen.tsx`, `AuthCard.tsx`: remover `forceSubscriptionActive(...)` do resultado do SDK; `await invokeServerSync()` e, se `subscribed`, chamar `refreshSubscription`/`forceSubscriptionActive(data.subscription_end)` com dado do servidor. `rc-sync` passa a retornar `subscription_end` em todos os casos.
- `SubscriptionRequired.tsx`: mesmo padrão, sem `window.location.reload()`.
- `revenuecat-webhook`: ramo `isAnonymous` → apenas log + 200; sem busca por `transaction_id`.
- Versão: `define: { __APP_BUILD__: new Date().toISOString() }` no `vite.config.ts`, constante `APP_VERSION = '1.1.0 (24)'` em `src/config/version.ts`; rodapé em `Profile.tsx`.
- Sem migration, sem build nativo (tudo Live Update + servidor).
