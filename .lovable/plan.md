## Objetivo
Aplicar em `/alimentos` (lista de alimentos) o mesmo padrão visual já adotado em `/profile/diets` e `/adicionar-refeicao`: card branco glass com faixa rosa lateral, borda e sombra rosadas.

## Arquivo
`src/pages/Alimentos.tsx` — linhas 149-168 (Card de cada alimento).

## Mudança
Substituir a className do `<Card>`:
- De: `bg-[#FFD1E7] border-0 rounded-2xl p-3 ... hover:bg-[#FFC1DE]`
- Para: `relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] p-3 pl-5 ... hover:bg-white before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]`

Manter conteúdo interno (nome, badge "Comunidade", porção/kcal e ícone Plus) intactos. Sem mudanças de lógica.