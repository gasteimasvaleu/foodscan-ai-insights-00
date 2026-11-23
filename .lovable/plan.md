# Menu "Mais" organizado por grupos

Hoje o menu "Mais" tem três blocos (Recursos Extras, Mais opções e Premium). Vou trocar por quatro grupos com título:

**Dieta**
Registrar refeição, NutriCoach, Gerar Cardápio, Receitas, Faça em Casa, Hidratação, Jejum Intermitente, Lista de Compras, Desafio 14 dias, ServiNUTRI, Nutricionista que Vende

**Treino**
Treinos, Objetivos, Gráficos e Progresso, Apple Health

**Vida**
Sono, Maternidade, Finanças, Músicas, Provador Virtual, Mercado Fácil, Loja

**Comunidade**
Comunidade, Tô Aqui, Quiz, Conquistas

## O que continua igual
- Cada item mantém o ícone, a descrição, o selo "Pro" e o cadeado para quem não é Pro.
- O aviso para assinar o Pro continua aparecendo para quem ainda não assinou, no topo do menu.
- Os títulos dos grupos seguem o padrão do app, sem ícones decorativos.

## Detalhes técnicos
- `src/components/ui/tubelight-navbar.tsx`: adicionar `group: 'dieta'|'treino'|'vida'|'comunidade'` em cada item de `moreSheetItems` e renderizar com um único componente de item, agrupado em ordem fixa, no lugar de `extrasItems`/`freeItems`/`proItems`.
