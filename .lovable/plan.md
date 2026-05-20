## Mudança

No bottom sheet do Menu "+", criar uma nova seção **Recursos Extras** no topo, com tema azul, contendo:

- Comunidade
- Tô Aqui
- Mercado Fácil
- Maternidade
- Provador Virtual (Pro)
- Nutricionista que Vende (Pro)

Esses 6 itens saem das seções atuais (Mais opções / Premium) e passam a viver apenas no grupo Recursos Extras.

## Como fica a ordem do sheet

1. **Recursos Extras** (azul, topo) — os 6 itens acima
2. **Mais opções** (rosa, atual) — sem os 4 free movidos
3. **Premium** (rosa, atual) — sem Provador e Nutricionista que Vende

## Detalhes visuais (Recursos Extras)

- Header: ícone `Sparkles` + título "Recursos Extras" em azul `#2563EB`
- Cards: fundo `bg-blue-50`, borda `border-blue-200`, ícone redondo `bg-blue-500/15` com cor `text-blue-600`, chevron azul
- Provador Virtual e Nutricionista que Vende mantêm badge **Pro** e ícone de cadeado quando o usuário não é Pro (mesma lógica atual), apenas dentro do tema azul

## Arquivo

Apenas `src/components/ui/tubelight-navbar.tsx`:

- Adicionar campo `isExtra: boolean` no array `moreSheetItems` (marcar os 6)
- Derivar `extrasItems`, `freeItems` (sem extras), `proItems` (sem extras)
- Renderizar `<section>` "Recursos Extras" antes das outras duas seções
- Importar `Sparkles` do `lucide-react`

Sem mudança de rotas, navegação ou regras de Pro.
