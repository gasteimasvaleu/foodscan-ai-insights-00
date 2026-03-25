

## Criar páginas de Política de Privacidade e Termos de Uso

### O que será feito

1. **Criar `src/pages/PrivacyPolicy.tsx`** — Página dedicada com o conteúdo de Política de Privacidade (extraído da página About atual), seguindo o mesmo layout/estilo das outras páginas.

2. **Criar `src/pages/TermsOfUse.tsx`** — Página dedicada com o conteúdo de Termos de Uso (extraído da página About atual), mesmo padrão visual.

3. **Atualizar `src/components/Navbar.tsx`** — Adicionar os dois novos itens ao array `menuItems`:
   - `{ label: 'Política de Privacidade', href: '/politica-de-privacidade' }`
   - `{ label: 'Termos de Uso', href: '/termos-de-uso' }`

4. **Atualizar `src/App.tsx`** — Adicionar as duas novas rotas:
   - `/politica-de-privacidade` → `PrivacyPolicy`
   - `/termos-de-uso` → `TermsOfUse`

Ambas as páginas seguirão o padrão visual existente (gradient background, Navbar, cards com backdrop-blur, `pt-[calc(env(safe-area-inset-top)+2.5rem)]`, `pb-28`).

