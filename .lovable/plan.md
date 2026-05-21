## Problema

Ao tocar em **Entrega** num pedido (página do Lojista), o modal "Acionar entrega" abre com os campos **Endereço completo**, **Cidade** e **WhatsApp do cliente** vazios. O lojista precisa digitar tudo manualmente, mesmo o cliente já tendo informado esses dados ao montar o pedido no carrinho.

Hoje a tabela `mf_order_log` guarda apenas `cliente_id`, `loja_id`, `itens`, `total_estimado_centavos` e `sent_at` — não persiste o snapshot do nome/endereço/telefone que o cliente usou no checkout, então o lojista não tem como recuperar.

## Solução

Persistir o snapshot do cliente em cada pedido enviado e usá-lo para pré-preencher o modal.

### 1. Banco — migração em `mf_order_log`

Adicionar colunas nullable (mantém compatibilidade com pedidos antigos):

- `cliente_nome text`
- `cliente_endereco text`
- `cliente_cidade text`
- `cliente_telefone text`

Sem mudanças em RLS: a policy `mf_order_log_select` já libera lojista dono da loja + próprio cliente.

### 2. Captura no checkout — `src/lib/mercado-facil/whatsapp.ts`

Estender a interface `SendArgs` com `endereco?`, `cidade?`, `telefone?`. O `sendOrderToWhatsApp` passa esses campos para o `insert` em `mf_order_log` (mapeados para as novas colunas).

### 3. Carrinho — `src/pages/mercado-facil/Carrinho.tsx`

No `handleSend`, passar para `sendOrderToWhatsApp`:
- `endereco` (state já existente)
- `cidade` (state já existente)
- `telefone: profilePhone`
- `clienteNome: profileName` (já passa)

### 4. Lojista — `src/pages/mercado-facil/LojistaPedidos.tsx`

- Adicionar os campos novos à interface `OrderLog`.
- Ao abrir o modal (no `onClick` do botão **Entrega**, linha ~193), pré-preencher:
  - `setEndereco(p.cliente_endereco ?? "")`
  - `setCidadeEntrega(p.cliente_cidade ?? loja.endereco?.cidade ?? "")`
  - `setTelCliente(p.cliente_telefone ?? "")`
- Opcional: mostrar o nome do cliente (`p.cliente_nome`) no topo do bloco do formulário como contexto ("Pedido de: João Silva"), para o lojista saber para quem é a entrega.

## Fora de escopo

- Não mexer no layout/estilo do modal (já foi ajustado).
- Não alterar a tabela `profiles` nem o fluxo de cadastro.
- Não migrar pedidos antigos — eles continuarão exibindo campos vazios (comportamento atual).
