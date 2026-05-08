## Aumentar limite de upload de thumbnails para 50 MB

Atualmente o componente `ThumbnailUpload` está fixado em 5 MB, o que bloqueia o upload mesmo após o aumento já feito no bucket do Supabase.

### Alteração

**`src/components/ThumbnailUpload.tsx`**
- Trocar `maxSize={5}` por `maxSize={50}`.

Isso já é suficiente — `FileUpload` apenas usa esse valor para validar o tamanho no cliente e exibir a mensagem ("Máximo 50MB"). Nenhuma outra mudança de código ou banco é necessária.

### Observação
O limite de vídeos (`VideoUpload`, hoje 100 MB) permanece inalterado.