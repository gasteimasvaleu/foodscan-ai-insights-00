## Objetivo

Permitir que o lojista exclua pedidos da lista em `/mercado-facil/lojista/pedidos`.

## 1. Banco — RLS de DELETE em `mf_order_log`

Hoje só existem policies de SELECT e INSERT. Adicionar policy de DELETE permitindo apenas:

- o lojista dono da loja do pedido, OU
- admin.

```sql
CREATE POLICY mf_order_log_delete_lojista ON public.mf_order_log FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.mf_lojas l WHERE l.id = loja_id AND l.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
```

A FK `mf_entregas.order_log_id` já tem `ON DELETE SET NULL`, então excluir o pedido não apaga histórico de entrega — só desvincula. (Não vou mudar esse comportamento.)

## 2. UI — `src/pages/mercado-facil/LojistaPedidos.tsx`

No card de cada pedido (linha ~161), adicionar um botão sutil de excluir (ícone `Trash2`) no canto superior direito, ao lado do total. Ao clicar:

1. Abrir `AlertDialog` (shadcn) de confirmação: "Excluir este pedido? Esta ação não pode ser desfeita."
2. Se confirmado: `supabase.from("mf_order_log").delete().eq("id", p.id)`.
3. Em sucesso: remover do state local `pedidos` e toast "Pedido excluído".
4. Em erro: toast destrutivo com mensagem.

Estado de loading por pedido (`deletingId`) desabilita o botão durante a operação.

## Fora de escopo

- Não alterar a entrega vinculada (`mf_entregas`) — continua existindo com `order_log_id = null`.
- Não adicionar exclusão em massa.
- Não permitir que o cliente apague o próprio pedido (escopo é o painel do lojista).
