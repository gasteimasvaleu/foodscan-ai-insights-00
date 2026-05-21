## Problema

Quando a loja exclui um pedido em `/mercado-facil/lojista/pedidos`, o registro em `mf_order_log` é apagado, mas a `mf_entrega` vinculada (via `order_log_id`) continua existindo. Por isso o card "Ver status do pedido" no carrinho do cliente continua mostrando aquele pedido.

## Solução

Apagar (ou cancelar) a entrega correspondente quando o pedido for excluído pela loja. Vou no nível do banco, para garantir consistência mesmo se o delete vier de outro lugar no futuro.

### Mudanças

1. **Migration**: criar trigger `AFTER DELETE` em `public.mf_order_log` que deleta `public.mf_entregas WHERE order_log_id = OLD.id`.
   - Trigger `SECURITY DEFINER` com `search_path=public`.
   - Como o componente `MFClientePedidosStatus` já escuta realtime em `mf_entregas` (`postgres_changes` event `*`), o card some sozinho assim que o delete propaga.

2. **Nenhuma mudança de frontend necessária** — o hook `useMFEntregas` já refaz fetch no realtime DELETE.

### Fora de escopo

- Mudar a lógica de exclusão da loja (continua deletando `mf_order_log`).
- Avaliação de entregas já feitas (não afetado).
- UI do card de status (sem alterações visuais).