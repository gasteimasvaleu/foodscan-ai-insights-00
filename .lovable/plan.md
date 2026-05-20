## Objetivo
Evitar que o botão "Enviar cadastro" fique escondido atrás da Tubelight Navbar em iOS real.

## Mudança
Em `src/pages/mercado-facil/EntregadorCadastro.tsx` (linha 125), aumentar o padding inferior do `<main>` e adicionar safe-area:

- De: `pb-28`
- Para: `pb-[calc(env(safe-area-inset-bottom)+9rem)]`

Isso garante espaço extra abaixo do botão respeitando o safe-area do iPhone.