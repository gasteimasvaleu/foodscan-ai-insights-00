

## Estilizar botão de fechar do Dialog

### Mudança em `src/components/ui/dialog.tsx` (linha ~46)

Adicionar fundo rosa primário, ícone branco e cantos arredondados ao `DialogPrimitive.Close`, seguindo o padrão descrito na memória de estilo:

- Adicionar classes: `bg-primary text-white rounded-lg p-1 hover:bg-primary/90`
- Remover `opacity-70` e `hover:opacity-100` (não necessários com fundo sólido)
- Manter o ícone X branco com tamanho `h-4 w-4`

