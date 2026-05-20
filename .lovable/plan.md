## Foto da loja: dropzone clicável com câmera translúcida

### Arquivo: `src/pages/mercado-facil/LojistaConfigLoja.tsx`

Substituir o bloco atual (preview 80x80 + botão "Enviar foto" lateral) por uma **única área clicável** estilo dropzone:

- `<label>` ocupando largura total, altura ~`h-40`, `rounded-2xl`, `border-2 border-dashed border-[#FD46A1]/40`, `bg-white/40`, `flex flex-col items-center justify-center gap-2`, `cursor-pointer`, `hover:bg-white/60 transition`.
- Conteúdo interno (translúcido, `opacity-60`):
  - Ícone `Camera` do lucide-react, `w-10 h-10`, cor `text-[#FD46A1]`.
  - Texto `"Toque para enviar a foto da loja"`, `text-sm text-foreground/70`.
- Quando `fotoUrl` já existir: a área vira um background da foto (`bg-cover bg-center`, com overlay escuro `bg-black/30` + ícone câmera + texto "Trocar foto" centralizados, ambos com `text-white/90`).
- Botão "Remover" pequeno permanece abaixo da área quando há foto (texto sublinhado discreto).
- Durante upload: overlay com spinner e texto "Enviando...".
- `<input type="file">` continua escondido dentro do label, comportamento de `handleFotoChange` inalterado.

Sem mudanças de schema, de estado ou da função `handleFotoChange`.