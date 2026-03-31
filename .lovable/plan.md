
Objetivo: trocar os inputs nativos de arquivo em **Foto Antes** e **Foto Depois** por botões brancos com texto rosa **“Adicionar Foto”**, mantendo o upload atual funcionando no modal de `/profile/assessment`.

1) Atualizar `src/pages/PhysicalAssessment.tsx` no formulário do modal
- Substituir os dois `<Input type="file" ... />` visíveis por:
  - um `<input type="file" className="hidden" id="before-photo-input" ... />`
  - um `<input type="file" className="hidden" id="after-photo-input" ... />`
- Manter os mesmos `accept="image/*"` e `onChange` atuais (`setBeforePhoto` / `setAfterPhoto`).

2) Criar gatilho visual com botão branco + texto rosa
- Para cada campo, usar `Button` com `type="button"` e estilo:
  - fundo branco (`bg-white`)
  - texto rosa (`text-primary` ou `text-[#FD46A1]`)
  - borda suave e largura total (`w-full`)
- O botão dispara o input oculto via `label htmlFor` ou `ref + click()`.

3) Texto solicitado no botão
- Label padrão dos dois campos: **“Adicionar Foto”**.
- (Opcional no mesmo ajuste) após seleção, exibir abaixo o nome do arquivo para feedback sem mudar a lógica de envio.

4) Preservar comportamento funcional
- Não alterar `handleSubmit`, `uploadToSupabase`, nem estrutura do payload.
- Garantir que `beforePhoto` e `afterPhoto` continuem chegando como `File` e que salvar/editar continue igual.

5) Validação visual e funcional (390x640)
- Abrir modal e confirmar:
  - os dois botões aparecem brancos com texto rosa;
  - toque no botão abre seletor de imagem;
  - seleção de arquivo atualiza estado;
  - envio da avaliação continua funcionando sem regressão.
