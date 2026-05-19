## Objetivo

No card "Tipo" da página do venue (`/to-aqui/venue/:id`), exibir o nome da categoria (Bar, Restaurante, Festa, etc.) em vez de só o emoji.

## Mudança

**Arquivo:** `src/pages/ToAquiVenue.tsx` (card linha ~121-125)

Hoje:
- Emoji grande + label "Tipo"

Depois:
- Emoji menor + nome da categoria (`cat.label`) + label "Tipo"
- Seguindo o mesmo padrão do card "Local" (valor + label embaixo)

`cat.label` já vem de `VENUE_CATEGORIES.find((c) => c.value === venue.category)` que está disponível no escopo.

## Sem mudanças

- Nada de banco / schema.
- Nenhum outro card é alterado.
