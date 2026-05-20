# Plano: Mercado Fácil nativo dentro do We Diet

Marketplace construído **direto no We Diet**, mesmo Supabase, mesmo auth, mesmo design system. **Sem checkout interno** — o pedido sai do carrinho direto para o WhatsApp do lojista cadastrado.

## Decisões consolidadas
- **Backend**: Supabase do We Diet (`zyhmwcsfifdepqnnrguo`). Tabelas com prefixo `mf_`.
- **Auth**: `auth.users` do We Diet (mesmo login).
- **Lojista = Pro**: rotas envoltas em `<ProRoute feature="mercado-facil-lojista">`. RevenueCat (iOS) / Hotmart (Web).
- **Pedido**: nada de checkout/pagamento. O carrinho gera uma mensagem formatada e abre o WhatsApp do lojista (`wa.me/<telefone>?text=...`) via `openExternal`. O atendimento, preço final, frete e pagamento são combinados direto entre cliente e loja no WhatsApp.
- **Entrada**: novo item "Mercado Fácil" no `BottomPlusMenu` → `/mercado-facil`.
- **Visual**: tokens do We Diet (#FD46A1, #F7FAFB, cards #FFD1E7 rounded-3xl, glassmorphism em modais).

---

## Rotas (em `src/App.tsx`)

```
/mercado-facil                       → MercadoFacilIndex (busca + categorias + destaques + lojas perto)
/mercado-facil/categoria/:slug       → MercadoFacilCategoria
/mercado-facil/produto/:id           → MercadoFacilProduto
/mercado-facil/loja/:id              → MercadoFacilLoja (vitrine + botão WhatsApp)
/mercado-facil/carrinho              → MercadoFacilCarrinho (gera msg WA e abre)

/mercado-facil/lojista               → ProRoute(LojistaDashboard)
/mercado-facil/lojista/produtos      → ProRoute(LojistaProdutos)
/mercado-facil/lojista/loja          → ProRoute(LojistaConfigLoja)

/admin/mercado-facil                 → AdminMercadoFacil (categorias, banners, moderação)
```

Esconder `TubelightNavbar` e `BottomPlusMenu` em `/mercado-facil/*` — sub-header rosa próprio com voltar + título + ícone carrinho.

---

## Estrutura de arquivos

```
src/pages/mercado-facil/
  Index.tsx, Categoria.tsx, Produto.tsx, Loja.tsx, Carrinho.tsx,
  LojistaDashboard.tsx, LojistaProdutos.tsx, LojistaConfigLoja.tsx

src/pages/admin/AdminMercadoFacil.tsx

src/components/mercado-facil/
  MFHeader.tsx          // sub-header rosa
  MFProductCard.tsx     // card rosa rounded-3xl, sem ícones decorativos
  MFCategoryCard.tsx
  MFCarouselSection.tsx
  MFSmartFilters.tsx    // chama mf-smart-recommendations
  MFCartDrawer.tsx
  MFLojaForm.tsx, MFProdutoForm.tsx

src/hooks/mercado-facil/
  useMFCart.ts          // carrinho POR LOJA, em localStorage
  useMFProducts.ts, useMFLojas.ts, useMFFavorites.ts

src/lib/mercado-facil/
  types.ts
  formatters.ts
  buildWhatsAppOrderMessage.ts   // monta texto do pedido
  sendOrderToWhatsApp.ts         // monta wa.me + openExternal
```

---

## Modelo de dados (tabelas novas, prefixo `mf_`)

Todas com `created_at`/`updated_at`, RLS por `auth.uid()`. Sem FK direta em `auth.users` (padrão do projeto).

- **`mf_categorias`** — name, slug, icon_emoji, parent_id, order. Público lê; admin gerencia.
- **`mf_lojas`** — owner_id, nome, slug, descricao, foto_url, banner_url, **telefone_whatsapp (obrigatório, E.164)**, endereco (jsonb com cidade/bairro), horario_funcionamento (jsonb), ativa. Owner edita as suas; público lê as `ativa=true`. INSERT/UPDATE exige `subscribers.subscribed=true` na RLS.
- **`mf_produtos`** — loja_id, categoria_id, nome, descricao, preco_centavos, preco_promo_centavos, foto_url, unidade (kg/un/L/…), estoque_visivel boolean, ativo. Owner gerencia os seus; público lê.
- **`mf_favoritos`** — user_id, produto_id (unique pair).
- **`mf_banners`** — title, image_url, link, order, ativo. Público lê; admin gerencia.
- **`mf_order_log`** (opcional, só métricas) — cliente_id, loja_id, itens (jsonb resumo), total_estimado_centavos, sent_at. Cliente insere o seu; lojista lê os da sua loja. **Não substitui pedido formal — é só registro de envio do WA pra estatística do lojista.**

Triggers:
- `update_updated_at_column` em todas.

Storage:
- Bucket público novo: `mercado-facil-produtos` (fotos de produtos, lojas, banners).

---

## Fluxo do "pedido por WhatsApp"

1. Cliente navega, adiciona produtos ao carrinho. O carrinho é **agrupado por loja** (cada loja vira um carrinho separado).
2. No `/mercado-facil/carrinho`, cada bloco-loja tem botão **"Enviar pedido pelo WhatsApp"**.
3. Ao clicar:
   - Monta mensagem padronizada (ver formato abaixo).
   - Registra em `mf_order_log` (não bloqueante; ignora falha).
   - Abre `https://wa.me/<telefone_whatsapp>?text=<mensagem_url_encoded>` via `openExternal` (`@capacitor/browser` no nativo, `window.open` na web).
4. Cliente sai do app pro WhatsApp e combina o resto direto com a loja.
5. Carrinho daquela loja é esvaziado (com toast: "Pedido enviado pro WhatsApp da {loja}").

### Formato da mensagem
```
🛒 Pedido via Mercado Fácil — We Diet

👤 {nome do cliente}
📍 {bairro/cidade se informado no perfil}

Itens:
• 2x Banana Prata — R$ 9,80
• 1x Leite Integral 1L — R$ 6,50
...

Total estimado: R$ 32,40

(Vou aguardar a confirmação de disponibilidade, frete e forma de pagamento por aqui.)
```

---

## Edge functions novas

- **`mf-smart-recommendations`** — recebe contexto (categoria, histórico/busca, lat-long opcional) e devolve produtos sugeridos via Lovable AI Gateway (Gemini Flash, function calling). `verify_jwt = true`.

Sem `checkout-create-order`, sem `notify-order-status`, sem `payment-*`.

---

## Fluxos chave

### Cliente
1. `/mercado-facil` → banners, categorias, "Pra você" (smart), busca por nome de produto ou loja.
2. Vê produto → "Adicionar ao carrinho".
3. Carrinho agrupado por loja → "Enviar pelo WhatsApp" → sai pro WA da loja.
4. Pode favoritar produtos e ver "Suas lojas favoritas".

### Lojista (Pro)
1. `/mercado-facil/lojista` (gated). Se não tem loja, abre `MFLojaForm`. **Telefone WhatsApp é obrigatório** (validação E.164, ex: `+5511999999999`).
2. Dashboard: produtos cadastrados, status (ativo/inativo), banner da loja, ver log de pedidos enviados (`mf_order_log` da loja).
3. CRUD de produtos com upload de foto.
4. Edita info da loja (telefone WA, horário, descrição, foto, banner).

### Admin
1. `/admin/mercado-facil`: gerencia categorias, banners globais, ativa/desativa lojas, modera produtos.

---

## Integração com o resto do We Diet

- **Menu +**: novo item "Mercado Fácil" 🛒.
- **Tema**: tokens existentes; nada novo.
- **`openExternal`**: usa o helper já existente em `src/lib/openExternal.ts` (mesmo padrão da Loja de afiliados).
- **Streaks/badges**: opcional, badge "Primeira indicação no MF" via insert em `mf_order_log`.

---

## Sequência de implementação

1. Migração SQL: tabelas `mf_*` + RLS + triggers + bucket `mercado-facil-produtos`.
2. Tipos e hooks base (`types.ts`, `useMFCart` com agrupamento por loja, `useMFProducts`, `useMFLojas`).
3. Helpers `buildWhatsAppOrderMessage.ts` + `sendOrderToWhatsApp.ts`.
4. Páginas Cliente: Index, Categoria, Produto, Loja, Carrinho.
5. `MFHeader`, `MFProductCard`, `MFCategoryCard`, esconder Navbar/Menu+ em `/mercado-facil/*`.
6. Edge function `mf-smart-recommendations`.
7. Páginas Lojista (gated por `ProRoute`) + form de loja com validação de WhatsApp.
8. `AdminMercadoFacil` (categorias, banners, ativar/desativar lojas).
9. Item "Mercado Fácil" no `BottomPlusMenu`.
10. Seed inicial: categorias padrão (Hortifrúti, Carnes, Padaria, Bebidas, Limpeza, Higiene, etc.) + 2-3 banners exemplo.

## Fora de escopo
- Checkout/pagamento dentro do app.
- Pedido como entidade no banco (loja gerencia tudo no WhatsApp dela).
- Entregador, ratings, tracking de pedido.
- Migração de dados do MF antigo (começa zerado).
