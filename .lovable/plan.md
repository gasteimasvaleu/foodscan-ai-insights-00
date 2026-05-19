## Objetivo

Aplicar o mesmo padrão visual de cards de `/profile/workout` aos cards da página `/nutricionista-que-vende`:

- Card externo: `bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)]` com listra rosa à esquerda via `before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]` (e `relative overflow-hidden`).
- Itens internos (sub-cards): `rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-4`.
- Títulos de seção continuam `text-base`, sem ícone decorativo (Core memory).

## Arquivos a alterar

1. **`src/components/nutri-sells/WeeklyIdeasCard.tsx`**
   - Wrapper: trocar `rounded-3xl bg-[#FFD1E7] p-4` por o card branco com stripe rosa (padding-left aumentado para `pl-5`).
   - Cada `<button>` de ideia: usar o estilo de sub-card `rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-3 hover:bg-[#FFD1E7]/60 transition-colors`.

2. **`src/components/nutri-sells/PostResultCard.tsx`**
   - Wrapper: mesmo card branco com stripe rosa, `pl-5`.
   - Sub-blocos internos (preview de imagem, legenda, bloco de receita): usar `rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15` no lugar de `bg-white/80 backdrop-blur-md` para igualar ao padrão workout.
   - Botões `outline` mantêm `rounded-2xl bg-white border-[#FD46A1]/20` (já compatível).

3. **`src/components/nutri-sells/PostHistoryGrid.tsx`**
   - Estado vazio: trocar `rounded-3xl bg-[#FFD1E7]` pelo card branco com stripe.
   - Cada item da grid: card branco com stripe rosa + miniatura interna `rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15`.

4. **`src/components/nutri-sells/PostGeneratorForm.tsx`** (verificar antes de editar; se hoje usa o wrapper rosa antigo, aplicar o mesmo card branco com stripe; campos do form não mudam).

## Fora de escopo

- Nenhuma mudança de lógica (geração de imagem, legenda, receita, persistência).
- Tabs e header da página continuam como estão.
- Sem alterar tokens globais nem `index.css`.

## Validação

- Conferir no preview mobile (390px) que os 4 cards exibem listra rosa esquerda, fundo branco translúcido, sombra rosa suave e os sub-itens em rosa claro, idênticos ao card de treino em `/profile/workout`.