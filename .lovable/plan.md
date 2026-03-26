

## Mover logo para dentro dos formulários de login

O logo está atualmente em um Card separado acima do banner (linhas 71-80), visível apenas para usuários logados. O correto é colocá-lo dentro dos formulários de login (tanto iOS nativo quanto Web).

### Mudanças em `src/components/AuthCard.tsx`

**Fluxo iOS nativo (linha 108-111)**: Adicionar a imagem do logo acima do `CardTitle "We Diet - Dieta Inteligente"` dentro do `CardHeader`.

**Fluxo Web (linha 193-195)**: Adicionar a imagem do logo acima do `CardTitle "Fazer Login"` dentro do `CardHeader`.

O logo no estado logado (linhas 71-80) pode ser mantido ou removido conforme preferência — ele continuará aparecendo para usuários autenticados.

