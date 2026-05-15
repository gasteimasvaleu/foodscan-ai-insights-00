## Objetivo
Aplicar o mesmo tratamento visual usado em `/profile/diets` (MyDiets) aos cards de refeição em `/adicionar-refeicao` (abas Recentes e Favoritos), trazendo mais hierarquia e respiro.

## Padrão de referência (MyDiets)
- Card branco com leve transparência: `bg-white/90 backdrop-blur-sm`
- Borda rosa suave: `border border-[#FD46A1]/30`
- Sombra rosada: `shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)]`
- Faixa rosa vertical à esquerda (gradient #FD46A1 → #FF7AC0) via pseudo `before:`
- `rounded-2xl`

## Arquivo
`src/pages/AdicionarRefeicao.tsx` — função `renderMealCard` (linhas 119-169) e card "Repetir refeições de ontem" (linhas 187-201).

## Mudanças
1. **renderMealCard**: trocar `bg-[#FFD1E7] border-0 rounded-3xl p-4` pelo padrão MyDiets (white/glass + pink stripe + shadow). Manter layout interno (foto/emoji, nome, macros, ações).
   - Ajustar paddings para acomodar a faixa lateral (`pl-5`).
   - Trocar fundo do placeholder do emoji de `bg-white/60` para `bg-[#FFD1E7]/50` para harmonizar com o novo fundo branco.
   - Manter botão "Logar" e ícone de favorito/lixeira como estão.

2. **Card "Repetir refeições de ontem"**: aplicar o mesmo padrão visual para consistência (white/glass + faixa lateral + shadow).

3. Sem mudanças de lógica, dados, hooks ou rotas.