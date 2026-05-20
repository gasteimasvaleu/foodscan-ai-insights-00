## Upload de foto da loja (substituir input de URL)

### Mudanças em `src/pages/mercado-facil/LojistaConfigLoja.tsx`
- Trocar o input "URL da foto" por:
  - Preview circular/quadrada da foto atual (`fotoUrl`).
  - Botão "Trocar foto" / "Enviar foto" que abre seletor de arquivo (`<input type="file" accept="image/*" hidden>`).
  - Botão "Remover" quando já há foto.
- Ao selecionar arquivo:
  - Upload para o bucket público `mercado-facil-produtos` (já existe e é usado em `LojistaProdutos.tsx`) em path `lojas/<user.id>/<timestamp>.<ext>`.
  - `getPublicUrl` → atualiza `fotoUrl` no estado (salvo junto ao restante no `handleSave`).
  - Toast de sucesso/erro.
- Mostrar spinner enquanto faz upload; desabilitar Salvar enquanto upload em andamento.

### Sem mudanças de schema ou banco
- Bucket `mercado-facil-produtos` já existe, é público e tem políticas (em uso em produtos).
- Coluna `foto_url` em `mf_lojas` permanece igual.