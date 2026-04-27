## Corrigir botão de fechar do modal de produto

O `DialogContent` do shadcn já renderiza automaticamente um botão de fechar no padrão do app (quadradinho rosa: `rounded-lg bg-primary p-1 text-white`, posicionado em `absolute right-4 top-4`). No `ProductDetailsModal` eu o havia escondido com `[&>button]:hidden` e adicionado um `DialogClose` customizado que ficou invisível/inadequado.

### Alteração em `src/components/loja/ProductDetailsModal.tsx`

1. **Remover o `[&>button]:hidden`** do `className` do `DialogContent` para que o botão X padrão (quadradinho rosa) volte a aparecer no canto superior direito.
2. **Remover o bloco `<DialogClose>` customizado** que adicionei junto com a importação de `X` e `DialogClose`.
3. Limpar imports: remover `X` do `lucide-react` e `DialogClose` do import de `@/components/ui/dialog`.

Resultado: o modal usará o botão de fechar nativo do `Dialog` do app, igual a todos os outros modais (AddObjectiveModal, AddExerciseModal, etc.).