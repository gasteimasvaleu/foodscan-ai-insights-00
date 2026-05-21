# Expor configurações de entrega na página da loja

## Problema
Os campos `aceita_entregador` (boolean) e `taxa_entrega_padrao_centavos` (int) já existem em `mf_lojas` e são usados em `LojistaPedidos.tsx` para decidir se o botão "Entregador do app" fica ativo e qual taxa pré-preencher. Mas a página `LojistaConfigLoja.tsx` não tem UI para o lojista alterar esses valores — todas as lojas ficam travadas em `false` / `0`.

## Mudança

### `src/pages/mercado-facil/LojistaConfigLoja.tsx`
Adicionar dois campos no formulário de edição da loja, dentro de uma seção **"Entrega"**:

1. **Switch "Aceitar entregador do app"** — controla `aceita_entregador`. Texto auxiliar: *"Permite acionar entregadores cadastrados na sua cidade. Se desligado, você fará a entrega por conta própria."*

2. **Input "Taxa de entrega padrão (R$)"** — controla `taxa_entrega_padrao_centavos`. Exibido em reais (ex: `12,50`), convertido para centavos no save. Só aparece quando o switch está ligado.

Persistir junto com o restante do form (mesmo `update` em `mf_lojas`). Usar padrões visuais do projeto (card `#FFD1E7`, switch e botões `#FD46A1`, input `text-base`).

## Fora de escopo
- Não muda schema (campos já existem).
- Não muda `LojistaPedidos.tsx`.
- Não muda a função `mf_entregadores_disponiveis`.

## Após implementação
O lojista vai em `/mercado-facil/lojista/loja`, liga "Aceitar entregador do app", define a taxa, salva — e o botão "Entregador do app" no modal de pedidos passa a ficar ativo.
