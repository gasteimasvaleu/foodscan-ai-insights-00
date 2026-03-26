

## Remover logo do AuthCard para testar OTA

Remover o bloco da imagem do logo (linhas 99-105) do `src/components/AuthCard.tsx`. Assim, após publicar um novo Web Build no Appflow, o app no celular deve mostrar a tela de login **sem** o logo — confirmando que o OTA está funcionando.

**Arquivo**: `src/components/AuthCard.tsx`
- Remover o `<div>` com a `<img>` do logo (linhas 99-105)

Após implementar, você deve:
1. Fazer commit/push
2. Publicar novo Web Build no canal Production no Appflow
3. Abrir o app no celular, fechar completamente, reabrir
4. Verificar se o logo sumiu da tela de login

