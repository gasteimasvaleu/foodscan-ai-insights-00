## Upload de capa em Admin Músicas

Hoje o campo "Capa custom" só aceita URL. Vou adicionar a opção de fazer upload de uma imagem direto do dispositivo, mantendo a URL como alternativa.

### Mudanças

1. **Novo bucket de Storage**: `musicas-capas` (público), via migration
   - Policies: SELECT público; INSERT/UPDATE/DELETE apenas para `has_role(auth.uid(), 'admin')`

2. **`src/pages/AdminMusicas.tsx`** — substituir o campo "Capa custom (URL)" por um bloco com:
   - Botão "Enviar imagem" (input file, aceita `image/*`)
   - Preview da capa atual (se houver `thumbnail_url`)
   - Botão "Remover" para limpar
   - Campo de URL ainda disponível como fallback recolhível ("Usar URL externa")
   - No upload: salva em `musicas-capas/{timestamp}-{nome}.{ext}`, pega `publicUrl` e seta em `form.thumbnail_url`
   - Estado `uploading` desabilitando o botão Salvar enquanto sobe
   - Validações: tipo `image/*`, tamanho máx. 2 MB

3. Nada muda no schema da tabela `playlists_musicas` — continua usando `thumbnail_url text`.

### Detalhes técnicos

- Usa `supabase.storage.from('musicas-capas').upload()` e `.getPublicUrl()`
- Fallback de thumbnail do YouTube em `/musicas` continua funcionando quando `thumbnail_url` for vazio
- UI mantém padrão glassmorphism / pink (#FD46A1) já usado no admin
