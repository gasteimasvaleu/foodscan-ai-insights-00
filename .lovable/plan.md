# Ajustar chips de sintomas

Pequeno ajuste visual nos chips das categorias e dos sinais de alerta (`SymptomsSection.tsx`).

## Mudanças

- **Alinhamento**: trocar `flex flex-wrap gap-2` por `flex flex-wrap gap-2 justify-start` nos containers — garante que todas as categorias fiquem alinhadas à esquerda (algumas estavam centralizando porque tinham poucos itens em telas estreitas).
- **Border radius dos chips**: trocar `rounded-full` por `rounded-lg` nos botões dos sintomas e dos red flags, deixando o visual menos pílula e mais discreto.
- Mantém cores, padding e estado ativo (`bg-[#FFD1E7] border-[#FD46A1]`).

## Fora do escopo

- Não mexe em outros componentes da Maternidade.
- Não altera badges, cards ou histórico.
