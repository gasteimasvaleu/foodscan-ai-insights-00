## Padronizar inputs do modal "Novo ciclo"

No modal, o grid `grid-cols-2` dos campos "Duração do ciclo" e "Duração da menstruação" espreme os labels (quebram em 2 linhas) e desalinha os inputs. Os labels também estão `text-xs`, fora do padrão do app.

### Mudança

Arquivo: `src/components/maternidade/tentantes/CycleTracker.tsx` (linhas 190–273)

- Remover o `grid grid-cols-2` — empilhar todos os campos em coluna única (`space-y-4`).
- Promover labels de `text-xs` para `text-sm text-gray-700` em todos os campos do form.
- Padronizar inputs/select/textarea com `h-12 rounded-xl` (textarea mantém altura por `rows`).
- Adicionar sufixo "dias" nos dois campos numéricos (ciclo e menstruação) num wrapper flex igual ao da Fertilidade.

### Fora do escopo

- Lógica de salvar, validação ou outros componentes.
