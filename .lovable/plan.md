## Objetivo
Padronizar o header da página `/comunidade/dm` (DMList) para o card header do app e mover o botão de voltar para dentro do card, alinhado à direita.

## Alteração
Arquivo: `src/pages/DMList.tsx`

- Substituir o header simples (`flex items-center gap-2 mb-4 px-1`) pelo card padrão do app:
  - Wrapper com `animate-fade-in`
  - Card: `bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3`
  - Ícone em `bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg` (usar ícone de mensagens, ex: `MessageCircle` do lucide-react)
  - Título: `text-lg font-bold text-primary flex-1` ("Mensagens")
  - Botão voltar: dentro do card, à direita, com `ArrowLeft` e navegação para `/comunidade`

- Importar o ícone necessário (`MessageCircle` ou similar do lucide-react).

## Resultado esperado
Header visualmente consistente com as páginas `/comunidade`, `/maternidade`, etc., com o botão de voltar integrado no card à direita.