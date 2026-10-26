# Venues ilimitados para o administrador

## O que encontrei
- O servidor já libera o admin (a regra de no máximo 3 venues não vale para administradores).
- Quem bloqueia hoje são as telas: "Meus venues" desativa o botão ao chegar em 3, e a tela de cadastro recusa o 4º.

## O que vou fazer
1. Em "Meus venues": para o admin, mostrar "X venues cadastrados" (sem "/3") e sempre deixar o botão "Cadastrar novo venue" ativo.
2. Na tela de cadastro: pular a checagem de 3 venues quando for admin.
3. Usuários comuns continuam com o limite de 3.

## Detalhes técnicos
- Checar admin com `supabase.rpc("has_role", { _role: "admin" })` em ToAquiOwner.tsx e ToAquiNewVenue.tsx.
- Sem mudança no banco.
