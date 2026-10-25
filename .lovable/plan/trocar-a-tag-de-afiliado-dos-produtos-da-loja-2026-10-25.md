# Trocar a tag de afiliado dos produtos da Loja

Hoje há 29 produtos cadastrados, todos links da Amazon:
- 28 com a tag `wedietapp-20`
- 1 com a tag `newhubsuperve-20` (Creatine 100% Pure, Atlhetica)

## O que será feito
- Trocar a tag de todos os 29 links para `dicasquefun04-20`, mantendo o resto do link igual.
- Conferir depois que todos os produtos ficaram com a nova tag.

Não muda nada no visual do app nem precisa de Live Update: a troca vale na hora.

## Detalhes técnicos
Atualização de dados em `affiliate_products.affiliate_url` com `regexp_replace(affiliate_url, '([?&]tag=)[^&]*', '\1dicasquefun04-20')`, seguida de consulta agrupando por tag para confirmar.
