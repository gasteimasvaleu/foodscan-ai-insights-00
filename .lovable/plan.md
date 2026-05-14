Reorganizar o sheet "Mais opções" do `TubelightNavbar` em `src/components/ui/tubelight-navbar.tsx` para listar primeiro as rotas free e depois as Pro, com indicação visual de cadeado nas Pro quando o usuário não for assinante.

Mudanças:

1. Adicionar campo `isPro: boolean` em cada item de `moreSheetItems`. Marcar como Pro (com base nas rotas atualmente envoltas em `<ProRoute>` em `App.tsx`):
   - Pro: `/graficos-progresso`, `/masterchef`, `/receitas`, `/nutri-coach`, `/apple-health`, `/hidratacao`, `/jejum`, `/objetivos`, `/sono`, `/faca-em-casa`, `/provador`, `/treinos`.
   - Free: o restante (`/adicionar-refeicao`, `/alimentos`, `/comunidade`, `/loja`, `/lista-de-compras`, `/servinutri`, `/maternidade`, `/quiz`, `/desafio-14-dias`, `/conquistas`).

2. Importar `useAuthContext` de `@/contexts/AuthProvider` e ler `subscriptionStatus.subscribed` para saber se é Pro ativo. Importar `Lock` e `Crown` de `lucide-react`.

3. Dentro do sheet, dividir em duas seções renderizadas em ordem:
   - "Grátis" (rotas free, ordem atual mantida).
   - "Premium" com pequeno selo "PRO" no cabeçalho (rotas Pro, ordem atual mantida).

4. Para itens Pro, quando `!subscribed`:
   - Mostrar um ícone `Lock` no canto direito (substituindo o `ChevronRight`).
   - Adicionar badge "PRO" pequeno com `bg-[#FD46A1] text-white` ao lado do nome.
   - Adicionar leve opacidade no card (`opacity-80`) e uma borda dourada/rosa diferenciada.
   - Manter o clique funcional — a navegação leva à rota e o `ProRoute` existente já redireciona para o paywall.

5. Quando `subscribed` (usuário Pro), os itens Pro aparecem normais (sem cadeado) mas mantêm o badge "PRO" sutil para identificar.

Sem mudanças em `App.tsx` ou em rotas. Apenas reorganização visual no sheet.