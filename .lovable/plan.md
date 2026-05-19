## Objetivo

Manter `/to-aqui` (listagem + entrada em venue + chat) totalmente pública e gatear apenas o cadastro/gerência de venues atrás do paywall Pro (ProRoute), seguindo o padrão do app.

## Estado atual em `src/App.tsx`

```
/to-aqui                       → ToAqui              (público)
/to-aqui/venue/:id             → ToAquiVenue         (público)
/to-aqui/venue/:id/chat        → ToAquiChat          (público)
/to-aqui/owner                 → ToAquiOwner         (público)  ← deve virar Pro
/to-aqui/owner/venue/new       → ToAquiNewVenue      (público)  ← deve virar Pro
```

## Mudanças

### 1. `src/App.tsx` — envolver rotas de owner com `ProRoute`

```tsx
<Route
  path="/to-aqui/owner"
  element={
    <ProRoute feature="to-aqui-owner">
      <ToAquiOwner />
    </ProRoute>
  }
/>
<Route
  path="/to-aqui/owner/venue/new"
  element={
    <ProRoute feature="to-aqui-owner">
      <ToAquiNewVenue />
    </ProRoute>
  }
/>
```

`ProRoute` já só efetivamente bloqueia em iOS nativo + free; web/android continuam abrindo normal. Isso mantém a paridade com o resto do app.

### 2. Nada a alterar em `/to-aqui`, `/to-aqui/venue/:id` e `/to-aqui/venue/:id/chat`
Continuam públicas. Os links internos para "Meus venues" e "Cadastrar venue" passam naturalmente pelo paywall quando o usuário toca neles (sem mudança de UI).

### 3. Sem mudanças de banco
RLS atual já permite leitura pública de venues e exige `auth.uid()` para criar — o gating Pro é apenas de UX/iOS, sem impacto em policies.

## Detalhes técnicos
- `ProRoute` importado de `@/components/ProRoute` (já usado em outras rotas).
- Sem alteração em hooks, edge functions ou tabelas.
