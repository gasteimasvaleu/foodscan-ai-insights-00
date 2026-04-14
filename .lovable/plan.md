

## Mover botão "Assistente de Metas" para dentro do card DailyGoals

### Mudanças

**`src/components/DailyGoals.tsx`**
- Adicionar prop `onOpenAIWizard` ao componente
- Adicionar botão "Assistente de Metas" com ícone Sparkles abaixo do botão "Editar" (linha 107)
- Estilo: `bg-[#FD46A1] hover:bg-[#e03d8f] text-white rounded-xl w-full` para manter a cor rosa padrão do app
- Texto: "Assistente de Metas" (sem "IA")

**`src/pages/DailyControl.tsx`**
- Passar `onOpenAIWizard={() => setShowAIWizard(true)}` como prop do `<DailyGoals>`
- Remover o botão "Assistente IA de Metas" standalone que está abaixo do `<DailyGoals>` (linhas ~380-387)
- Manter o botão "Assistente IA de Metas" dentro do card "sem metas" (quando `goals` é null)

