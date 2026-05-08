# Refinar card do último vídeo (HeroDeckRow)

## Mudança
Remover a faixa branca inferior com título + chevron. O card passa a ser **só a thumb** ocupando 100% da altura/área, com o título do vídeo sobreposto em uma faixa translúcida preta na parte inferior.

## Layout

```text
┌──────────────────────────┐
│                          │
│      THUMB (cover)       │
│                          │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← faixa preta 60% opacidade
│  Último treino           │     com texto branco
│  Título do vídeo      ›  │
└──────────────────────────┘
```

## Detalhes
- Card vira `relative` com `aspect` removido — a thumb ocupa o card inteiro via `absolute inset-0 object-cover`. Altura segue ditada pelo card 4:5 ao lado (`items-stretch` continua).
- Faixa inferior: `absolute bottom-0 inset-x-0 bg-black/55 backdrop-blur-sm px-3 py-2.5 text-white`, com label pequeno "Último treino" em `text-[10px] uppercase tracking-wide text-white/70` e título do vídeo em `text-base` truncado em 1 linha. Chevron branco à direita.
- Fallback (sem `thumbnail_url`): mantém gradiente rosa + ícone `Dumbbell` centralizado, faixa inferior continua aparecendo com "Ver treinos".
- Bordas: `rounded-3xl overflow-hidden` no card; remover o `bg-[#FFD1E7]` (não aparece mais).
- Clique segue indo para `/treinos`.

## Arquivo
- `src/components/HeroDeckRow.tsx` — apenas reestrutura JSX do botão esquerdo. Card de passos não muda.