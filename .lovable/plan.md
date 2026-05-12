## Refatorar card de inputs da aba Fertilidade

O card rosa (`#FFD1E7`) com os campos "1º dia da última menstruação" e "Duração média do ciclo" está com UX ruim no mobile: o grid de 2 colunas espreme os inputs, faz o label quebrar em 2 linhas e o ícone do date picker fica colado na borda do input.

### Mudança

Arquivo: `src/components/maternidade/tentantes/FertilityCalculator.tsx` (linhas 51–76)

- Trocar o `grid grid-cols-2 gap-3` por layout em coluna única (`space-y-4`) para que cada campo ocupe a largura total.
- Padronizar inputs com `h-12 rounded-xl` e label `text-sm` em `text-gray-700` (sem quebra).
- Para "Duração média do ciclo", agrupar input + sufixo "dias" num wrapper flex (input ocupa o restante, sufixo cinza alinhado à direita) para deixar claro a unidade.
- Manter `bg-[#FFD1E7]` do card e `text-base` nos inputs (regra iOS zoom).

### Fora do escopo

- Lógica de cálculo, persistência ou outros cards da página continuam iguais.
- Não substituir o `<input type="date">` nativo por picker custom.
