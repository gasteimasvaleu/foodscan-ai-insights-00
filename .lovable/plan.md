## Objetivo

Adicionar um **card header de marketing** no topo da página individual de categoria (`/mercado-facil/categoria/:slug`), acima do buscador, no padrão visual do app.

## Onde

- `src/pages/mercado-facil/Categoria.tsx` — inserir o novo card logo abaixo do `MFHeader` e acima do input de busca.

## Componente novo

`src/components/mercado-facil/MFCategoryHero.tsx`

- Card no padrão do app: `rounded-3xl bg-[#FFD1E7]` com `p-4`.
- Layout horizontal:
  - Esquerda: título curto (`text-base`, peso normal, conforme regra de tipografia do app) + 1 linha de subtítulo de marketing (`text-xs text-foreground/70`).
  - Direita: `icon_emoji` grande (`text-4xl`) dentro de um círculo `bg-white/60 backdrop-blur-md`.
- Sem ícones decorativos no título (regra do design system).
- Fallback de emoji "🛒" quando a categoria não tiver `icon_emoji`.

## Conteúdo de marketing

Como há ~120 categorias, não vamos criar copy manual para cada uma. Estratégia:

1. **Mapa pequeno** em `src/lib/mercado-facil/categoryCopy.ts` com taglines curtas para as categorias mais relevantes (ex.: `mercearia`, `bebidas`, `hortifruti`, `padaria`, `limpeza`, `higiene`, `pet`, `bebes`, `cafes`, `frutas-e-verduras`, `laticinios`, `carnes-e-aves`, `frios`, `congelados`, `doces`, `sorvetes`, `lanches`, `pizzas-salgadas`, `cervejas`, `vinhos`, `acai`, `agua`, `gas`, `cigarros`, `medicamentos`, `beleza`, `suplementos`).
   - Formato: `{ slug: { title: string, subtitle: string } }`.
   - Texto curto, tom de marketing leve (ex.: Mercearia → "O básico que não pode faltar" / "Arroz, feijão, óleo e mais perto de você").
2. **Fallback genérico** quando o slug não estiver no mapa: usa `cat.name` como título e uma subtitle padrão tipo "Tudo que você precisa em {nome da categoria}, entregue rápido."

## Comportamento

- Renderiza só após `cat` carregar (evita flash com "Categoria" placeholder).
- Margem inferior `mb-3` para alinhar com o espaçamento atual do buscador.

## Fora de escopo

- Não edita imagens, banners reais ou campos novos no banco. Só copy local + emoji existente.
- Não muda a página principal nem a página da loja.
