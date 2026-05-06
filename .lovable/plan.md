# Adicionar entrada para `/assinar` no perfil

## Objetivo
Inserir um card de upsell para o plano Pro na página `/profile`, posicionado entre o card do usuário (foto/nome) e o card "Ações Rápidas". Esse card será o ponto de entrada principal dos usuários comuns para a página `/assinar`.

## Comportamento

**Usuário FREE** — exibe card de upgrade:
- Fundo: gradiente `from-[#FD46A1] to-[#FF6FB5]` (destaca da paleta rosa clara dos demais cards).
- Ícone `Crown` à esquerda.
- Título: "Desbloqueie o We Diet Pro".
- Subtítulo: "FoodScan ilimitado, NutriCoach IA, cardápios e muito mais."
- Botão/seta à direita indicando navegação.
- Card inteiro clicável → `navigate("/assinar?reason=profile_upsell")`.

**Usuário PRO** — exibe card de status (mais discreto):
- Fundo branco/glassmorphism.
- Ícone `Crown` em rosa.
- Título: "We Diet Pro ativo".
- Subtítulo curto com data de expiração quando disponível (ex: "Renova em DD/MM/AAAA"), caso contrário "Aproveite todos os recursos".
- Sem ação de clique (ou link discreto para gerenciar assinatura, se já existir rota — manter fora do escopo se não existir).

## Arquivo a alterar

- `src/pages/Profile.tsx` — inserir o novo `<Card>` entre as linhas 288 (fechamento do card de header) e 290 (comentário "Ações Rápidas").

## Detalhes técnicos

- Verificar status Pro pelo hook/contexto já usado no projeto (mesmo usado por `ProRoute` / `PaywallScreen`). Provavelmente `useAuth()` ou `useSubscription()` — reutilizar, não criar novo.
- Respeitar regras de UI do projeto: `rounded-3xl`, `text-base` no título, sem ícones decorativos no `CardTitle` (o `Crown` fica dentro do conteúdo, não no título — ou usar layout customizado sem `CardTitle`).
- Manter `mb-8` para espaçamento consistente com os outros cards.
- Não criar componente novo se a lógica couber em ~30 linhas inline; caso cresça, extrair para `src/components/profile/ProUpsellCard.tsx`.

## Fora do escopo
- Não alterar a página `/assinar` em si.
- Não mexer em `ProRoute`, `QuickActions` ou outros pontos de entrada já existentes.
- Não adicionar gerenciamento de assinatura (cancelar/trocar plano).
