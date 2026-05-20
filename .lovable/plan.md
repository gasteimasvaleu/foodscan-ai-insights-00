Adicionar carrossel de "Ofertas em destaque" na home `/mercado-facil`, populado automaticamente por produtos com preço promocional, visível para todos os usuários, posicionado entre as seções existentes.

## Fonte dos dados

Tabela `mf_produtos` (já existe, sem migration necessária):
- Filtro: `ativo = true AND preco_promo_centavos IS NOT NULL AND preco_promo_centavos < preco_centavos`.
- Join com `mf_lojas` (`ativa = true`) para pegar nome/logo/slug da loja.
- Ordenação: maior desconto percentual primeiro `((preco - promo) / preco)`.
- Limite: 12 produtos (mais que isso polui o carrossel).

Como é leitura pública de produtos ativos, RLS atual já permite (mesmo critério dos outros componentes do Mercado Fácil). Sem mudanças de policy.

## Componente novo

**`src/components/mercado-facil/OfertasDestaqueCarousel.tsx`**
- Adaptação do componente OfferCard sugerido pelo usuário, alinhado ao DS We Diet:
  - Card: 260×340px, `rounded-3xl`, imagem do produto cobrindo, overlay gradiente preto/transparente embaixo.
  - Tag superior esquerda: pill `#FD46A1` branca com texto "-XX% OFF" (calculado em runtime).
  - Footer do card: nome do produto (text-base, branco), nome da loja (text-xs, white/80), preço promo destacado em `#FFD1E7` riscando o preço original.
  - CTA: pill rosa com seta (mesmo padrão do chevron do accordion novo) no canto inferior direito.
- Scroll horizontal nativo com `scroll-snap-x mandatory`, `snap-center` em cada card. Sem setas laterais (mobile-first, app nativo) — só swipe + dots de paginação opcionais embaixo.
- `loading="lazy"` + `decoding="async"` em todas as imagens.
- Tap no card → navega para `/mercado-facil/produto/:id` (rota já existente).
- Skeleton de 3 cards enquanto carrega.
- Se não houver produtos em promoção, o componente retorna `null` (não mostra nada, nem header vazio).

## Hook de dados

**`src/hooks/mercado-facil/useOfertasDestaque.ts`**
- React Query (`useQuery`), key `["mf-ofertas-destaque"]`, `staleTime: 5min`.
- Faz o SELECT acima.
- Retorna array tipado `{ id, nome, foto_url, preco_centavos, preco_promo_centavos, desconto_pct, loja: { nome, foto_url, slug } }`.

## Integração na página

**`src/pages/mercado-facil/Index.tsx`** (já existe — não vi conteúdo, mas a página é a home /mercado-facil):
- Inserir `<OfertasDestaqueCarousel />` entre duas seções existentes (categorias e lojas, idealmente). Posição exata será decidida ao ler o arquivo.
- Header da seção: "Ofertas em destaque" (text-base, font-normal, sem ícone, padrão do DS).

## Fora de escopo

- Sem painel admin para curar ofertas (é 100% automático).
- Sem expiração de promoção (lojista controla zerando `preco_promo_centavos`).
- Sem analytics de clique no carrossel.
- Sem mudança nos cards/produtos existentes da página.
- Sem nova migration, sem novas policies.

## Memória

Adicionar entrada `[MF Ofertas Destaque](mem://features/mercado-facil/ofertas-destaque)` documentando: fonte automática via `preco_promo_centavos`, posição entre seções, público livre.

## Risco

Baixo. 1 hook + 1 componente + 1 import na home. Sem mudanças de schema, sem RLS.
