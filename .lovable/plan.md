## Problema
Em `/mercado-facil/entregador/cadastro`, o botão voltar usa `backTo="/mercado-facil/entregador"`. Se o usuário ainda não tem cadastro de entregador, essa página provavelmente redireciona de volta para o cadastro, criando um loop em que o botão nunca leva o usuário para fora.

## Mudança
Em `src/pages/mercado-facil/EntregadorCadastro.tsx` (linha 124), trocar:

- `backTo="/mercado-facil/entregador"` → `backTo="/mercado-facil"`

Assim o botão voltar do header retorna direto para a home do Mercado Fácil.