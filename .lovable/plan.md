## Card "Seja Pro" em `src/pages/ToAqui.tsx`

Adicionar logo abaixo do card header (após linha 36) um Card clicável no padrão do upsell de `Profile.tsx`:

- Gradiente `from-[#FD46A1] to-[#FF6FB5]`, `rounded-3xl`, `shadow-xl`
- Ícone `Crown` (lucide) em quadrado branco translúcido (`bg-white/25 backdrop-blur-md`)
- Texto: **"Adicione seu bar, restaurante ou festa"** + sub: "Seja Pro para divulgar seu local no Tô Aqui"
- `ChevronRight` à direita
- onClick → `navigate('/assinar?reason=to_aqui_owner_upsell')`
- Só aparece para usuários **não Pro** (usar mesma flag/contexto que `Profile.tsx` usa via `subscriptionStatus`)

Precisarei converter `Link`s para `useNavigate` e checar status de assinatura via o hook já usado no projeto (verificar em Profile.tsx qual é).
