# Esconder produtos de lojas desativadas

Quando uma loja estiver desativada, nenhum produto dela aparece para os clientes: nem na home do Mercado Fácil, nem nas categorias, nas ofertas em destaque, na página da loja ou ao abrir o link direto do produto. O dono da loja e o admin continuam vendo e editando os produtos normalmente.

## Como
- Mudar a regra de leitura dos produtos no banco. Para o público, um produto só aparece se ele estiver ativo **e** a loja dele também estiver ativa. Dono e admin continuam vendo tudo.
- Isso já resolve todas as telas de uma vez, sem mexer em cada uma.
- Na página do produto, quando ele não estiver disponível, mostrar "Produto indisponível" com um botão para voltar.

## Detalhes técnicos
- Migration: drop/recreate policy `mf_produtos_select_public` with `(ativo = true AND EXISTS (SELECT 1 FROM mf_lojas l WHERE l.id = loja_id AND l.ativa = true)) OR owner OR admin`.
- Check that `Produto.tsx` handles a null result gracefully.
