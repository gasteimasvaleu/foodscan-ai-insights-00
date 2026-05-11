## Problema

`HomeRecipeCard.tsx` quebra com `Cannot read properties of undefined (reading 'calorias')` porque assume que toda receita vem com objetos completos. Quando a IA retorna só parte do comparativo (ex.: `comparativoNutricional` presente mas sem `original` ou sem `caseiro`), ou uma receita salva antiga não tem `informacoesNutricionais`, o componente quebra a página inteira.

Pontos frágeis no arquivo:
- L33–48: `recipe.informacoesNutricionais` é usado direto (`nutri.calorias`, etc.) sem checagem.
- L161–180: `comp && (...)` só checa o objeto pai, mas acessa `comp.original.calorias`, `comp.caseiro.calorias`.
- L182–198: `versao && (...)` acessa `versao.beneficios.map` sem verificar se é array.

## Correção (frontend, defensiva)

Em `src/components/faca-em-casa/HomeRecipeCard.tsx`:

1. **`nutri` seguro**: tratar `recipe.informacoesNutricionais` como possivelmente `undefined`. Usar `const nutri = recipe.informacoesNutricionais ?? {}` e ler campos via optional chain. Esconder o bloco "Informações nutricionais" se nenhum valor existir.
2. **`comp` seguro**: só renderizar a seção "Original vs Caseiro" quando `comp?.original` E `comp?.caseiro` existirem. Dentro, usar optional chain (`comp.original?.calorias`) com fallback `—`.
3. **`versao` seguro**: renderizar a seção apenas se `Array.isArray(versao?.beneficios) && versao.beneficios.length > 0`.
4. **`dicas` / `variacoes`**: já usam `?.length`, manter; só envolver `.map` em `Array.isArray` para não quebrar se vier objeto.

Sem mudanças em backend, types, hooks ou outras telas.

## Resultado
- A página `/faca-em-casa` deixa de ficar em branco quando a IA devolve um JSON parcial ou quando uma receita salva antiga não tem todos os campos opcionais. Seções incompletas simplesmente não aparecem.