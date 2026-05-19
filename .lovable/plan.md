## Objetivo

Substituir o campo "Foto (URL)" do cadastro de venue por um upload real de imagem, com preview e botão de remover. A URL pública resultante é salva em `venues.photo_url`.

## Passos

1. **Bucket de Storage** (`venue-photos`, público)
   - Migration cria o bucket e políticas RLS em `storage.objects`:
     - Leitura pública
     - Upload/Update/Delete apenas pelo dono (path começa com `auth.uid()/...`)

2. **Componente de upload em `ToAquiNewVenue.tsx`**
   - Substitui o `<Input>` de URL por:
     - Botão "Escolher foto" (abre seletor com `accept="image/*"`)
     - Preview quadrado arredondado quando há foto
     - Botão "Remover"
   - Ao escolher arquivo:
     - Valida tipo (image/*) e tamanho (≤ 5 MB)
     - Faz `supabase.storage.from('venue-photos').upload(\`${user.id}/${crypto.randomUUID()}.${ext}\`, file)`
     - Pega URL pública via `getPublicUrl` e guarda em `form.photo_url`
   - Estado `uploading` desabilita o botão e mostra spinner
   - Botão "Remover" apaga o objeto no Storage (se já enviado) e limpa `photo_url`

3. **UX**
   - Mantém visual padrão (cards `#FFD1E7`, botões `#FD46A1`, `rounded-3xl`)
   - Aviso pequeno: "JPG ou PNG, até 5 MB"

## Detalhes técnicos

- Bucket público para servir imagens sem URL assinada.
- Path: `{user_id}/{uuid}.{ext}` — combina com a regex de RLS `(storage.foldername(name))[1] = auth.uid()::text`.
- `ToAquiVenue.tsx` já lê `photo_url` direto, sem mudanças necessárias.
- Sem alteração de schema da tabela `venues`.
