## Reorganizar modal "Acionar entrega" do lojista

### Problema
No modal atual (`LojistaPedidos.tsx`, Dialog ~linha 264):
- Ao escolher "Entregador do app", **não aparece a lista de entregadores disponíveis** — o lojista preenche endereço/taxa e clica em "Publicar entrega", sem ver quem vai aceitar.
- Os campos (endereço, cidade, taxa, telefone) e o botão único "Publicar entrega" / "Registrar entrega própria" servem para dois fluxos muito diferentes, ficando confuso qual campo é obrigatório em cada caso.
- O componente `MFEntregadoresDisponiveis` já existe (usado no Carrinho do cliente) e mostra cards de entregadores com botão "Chamar" — mas não está sendo usado aqui.

### Solução proposta (apenas UI deste modal)

Reestruturar o `DialogContent` em **3 blocos claros** com base no modo selecionado:

**1. Cabeçalho com seletor de modo (mantém)**
- Toggle "Entregador do app" / "Entrega própria" já existe — manter visual.
- Adicionar abaixo do toggle uma frase curta explicando o que vai acontecer em cada modo (1 linha cada), substituindo as duas notas atuais espalhadas.

**2. Dados da entrega (sempre visível)**
Agrupar num card `bg-[#FFD1E7]/40 rounded-2xl p-3`:
- Endereço completo *(obrigatório)*
- Cidade *(obrigatório)*
- WhatsApp do cliente *(opcional, só relevante no modo "app" — exibir hint condicional)*
- Taxa (R$) — mostrar label "Taxa sugerida ao entregador" no modo app e "Taxa cobrada do cliente" no modo própria

**3. Bloco final que muda conforme o modo**

- **Modo "Entregador do app":**
  - Renderizar `<MFEntregadoresDisponiveis ... />` passando `loja`, `cidade`, `endereco`, `clienteId = openEntrega.cliente_id`, `itens`, `totalCentavos`.
  - Acima dele, um pequeno passo guiado: "1. Confirme endereço e taxa acima  •  2. Escolha um entregador abaixo e toque em **Chamar**".
  - **Remover** o botão "Publicar entrega" neste modo — o disparo passa a ser feito pelo botão "Chamar" de cada card de entregador (já implementado no componente: abre WhatsApp do entregador). Ainda criar o registro em `mf_entregas` com `status: 'disponivel'` **antes** de abrir o WhatsApp, para que o card de status do pedido reflita "Aguardando entregador". Isso pode ser feito envolvendo a chamada do `MFEntregadoresDisponiveis` num wrapper local que primeiro cria a entrega e depois chama o handler original — ou passando um callback novo. Detalhe técnico na seção abaixo.
  - Se a lista vier vazia, o próprio componente já mostra "Nenhum entregador disponível agora em {cidade}".

- **Modo "Entrega própria":**
  - Esconder o bloco de entregadores.
  - Manter o botão único "Registrar entrega própria" no rodapé do modal.

**4. Rodapé**
- Modo app → nenhum botão de submit (a ação é o "Chamar" da lista).
- Modo própria → botão "Registrar entrega própria" full-width.

### Detalhes técnicos

- O `MFEntregadoresDisponiveis` atual chama `sendDeliveryRequestToWhatsApp` direto, sem criar `mf_entregas`. Para que o status apareça no card do pedido logo após chamar, precisamos garantir que uma linha em `mf_entregas` (status `disponivel`) seja criada nesse momento. Opções:
  - **(A) Mais simples:** No `LojistaPedidos`, antes de renderizar a lista, criar a entrega "draft" assim que o usuário entrar no modo "app" e preencher endereço+cidade+taxa (com debounce ou ao clicar em "Chamar" via callback). Isso exige expor um `onBeforeChamar` no componente, ou duplicar o fluxo no wrapper local.
  - **(B) Recomendado:** adicionar uma prop opcional `onBeforeCall?: (entregador) => Promise<void>` em `MFEntregadoresDisponiveis`, chamada antes de `sendDeliveryRequestToWhatsApp`. No `LojistaPedidos`, esse callback faz o `insert` em `mf_entregas` com `status: 'disponivel'` e fecha o modal em caso de sucesso.
- Validar endereço/cidade no callback para evitar enviar mensagem sem dados.
- Manter `criarEntrega` apenas para o caminho "própria".
- Não mexer em RLS, schema, edge functions nem no fluxo do cliente.

### Fora de escopo
- Nenhuma alteração de backend, tipos, hooks, ou no componente do cliente (`Carrinho.tsx`).
- Nenhuma mudança no card de status do pedido (já refeito no turno anterior).
- Não muda lógica de `quem_aciona_entregador` — apenas respeita: se a loja tem `quem_aciona_entregador === 'cliente'`, o botão "Entregador do app" continua desabilitado como já está.
