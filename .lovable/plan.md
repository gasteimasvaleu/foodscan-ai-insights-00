## Objetivo

No carrinho do cliente (`/mercado-facil/carrinho`), além do botão "Enviar pedido pelo WhatsApp do lojista", mostrar a **lista de entregadores disponíveis** com botão para chamar cada um pelo WhatsApp.

## Fluxo

1. Cliente preenche **Cidade** e **Endereço de entrega** (campos novos no topo do carrinho, persistidos em localStorage).
2. Após enviar o pedido para o lojista pelo WhatsApp, aparece a seção **"Entregadores disponíveis na sua cidade"**.
3. Lista mostra entregadores com `status='aprovado'` + `disponivel=true` + `cidade = cidade do cliente`, com nome, veículo, avaliação e botão "Chamar pelo WhatsApp".
4. Ao clicar em "Chamar":
   - Cria um registro em `mf_entregas` (status `disponivel`, com `loja_id`, `lojista_id`, `cliente_id`, `endereco_entrega`, `cidade`, `telefone_cliente`, `telefone_lojista`).
   - Abre WhatsApp do entregador com mensagem pré-formatada:
     > Olá! Tenho um pedido na loja **{Nome da Loja}** pronto para retirada em {endereço da loja, se houver}, com entrega em **{endereço do cliente}** ({cidade}). Você tem interesse em fazer essa entrega? Aguardo seu retorno por aqui. 🛵

## Mudanças

### 1. `src/pages/mercado-facil/Carrinho.tsx`
- Adicionar 2 inputs no topo: **Cidade** e **Endereço completo** (persistidos em `localStorage` `mf_delivery_address_v1`).
- Para cada loja no carrinho, abaixo do botão de WhatsApp da loja, renderizar novo componente `<MFEntregadoresDisponiveis lojaId cidade endereco />`.

### 2. Novo: `src/components/mercado-facil/MFEntregadoresDisponiveis.tsx`
- Recebe `loja: MFLoja`, `cidade`, `endereco`, `clienteId`, `clienteNome`, `itens`.
- Query: `mf_entregadores` onde `status='aprovado'` e `disponivel=true` e `cidade ilike cidade do cliente`. Limita 10. Ordena por `avaliacao_media desc`.
- Estado vazio: "Nenhum entregador disponível agora em {cidade}. Você pode combinar a retirada direto com a loja."
- Botão "Chamar pelo WhatsApp" por entregador, desabilitado se cidade/endereço vazios.

### 3. Nova função em `src/lib/mercado-facil/whatsapp.ts`
- `sendDeliveryRequestToWhatsApp({ entregador, loja, cliente, endereco, cidade, itens, totalCentavos })`:
  - Insere em `mf_entregas` com `status='disponivel'`, taxa = `loja.taxa_entrega_padrao_centavos ?? 0`.
  - Monta mensagem (texto acima) e abre `wa.me` do entregador via `openExternalUrl`.

### 4. RLS de `mf_entregas`
- Verificar/garantir policy de INSERT para autenticados onde `cliente_id = auth.uid()`. Se não existir, será adicionada via migration.

## Detalhes técnicos

- Filtro de cidade: normalizar com `ilike` e `trim` para robustez.
- Não bloqueia o fluxo atual: o botão "Enviar pedido pelo WhatsApp" do lojista continua funcionando exatamente como hoje.
- Componente segue padrão visual: card branco `rounded-3xl`, botões `#25D366` para WhatsApp, inputs com `text-base` (anti-zoom iOS).
- Não altera tabelas além de eventual policy em `mf_entregas`.

## Fora do escopo

- Notificação push ao entregador.
- Fluxo de aceite/recusa dentro do app (já existe em `EntregadorDashboard`, será preenchido naturalmente quando o entregador aceitar a `mf_entrega` criada).
- Cálculo automático de taxa por distância.