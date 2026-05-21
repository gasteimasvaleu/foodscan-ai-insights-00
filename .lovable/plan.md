O DialogContent do shadcn já possui um botão X nativo (`bg-primary`, `absolute right-4 top-4`). Em `Musicas.tsx`, existe um segundo X adicionado manualmente dentro do header, gerando duplicação e desalinhamento.

## Mudanças

### 1. Remover botão X duplicado — `src/pages/Musicas.tsx`
- Excluir o `<Button>` com ícone X e sua função `onClick={() => setActive(null)}` (linhas 123-130).
- Remover o wrapper `flex items-start justify-between gap-3` que existia apenas para acomodar o X ao lado do título.
- Deixar o título/descrição como bloco simples com `mb-3` e `pr-8` para evitar sobreposição com o X nativo do DialogContent.

### 2. Ajustar formato do X nativo — `src/components/ui/dialog.tsx`
- Alterar `rounded-lg` para `rounded-full` no `<DialogPrimitive.Close>` (linha 45), alinhando ao padrão do projeto ([Refined Buttons](mem://style/ui-buttons-refined)).

## Resultado
- Apenas 1 botão X visível, posicionado corretamente no canto superior direito do modal.
- X mantém o fundo rosa `#FD46A1` e formato circular do projeto.
- Sem impacto em outras telas — o ajuste em `dialog.tsx` é apenas arredondamento global de botões close.