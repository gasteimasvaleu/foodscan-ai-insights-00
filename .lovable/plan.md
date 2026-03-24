

## Remover espaço inferior da faixa branca do Tubelight

O menu está posicionado com `bottom-6` (24px do fundo da tela), e a faixa branca tem `-inset-y-3` (12px extra para cima e para baixo). Mesmo assim, sobra espaço entre a faixa e o fundo da tela.

### Alteração em `src/components/ui/tubelight-navbar.tsx`

**1. Linha 44**: Trocar `bottom-6` por `bottom-0` — cola o menu no fundo da tela

**2. Linha 49**: Ajustar a faixa branca para estender até o fundo da tela — trocar `-inset-y-3` por `-top-3 -bottom-0` e remover `rounded-3xl` em favor de `rounded-t-3xl` (arredondamento só em cima)

Também adicionar padding-bottom no menu container para dar respiro do safe-area em dispositivos com notch.

