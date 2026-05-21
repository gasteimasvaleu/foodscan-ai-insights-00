Remover a validação de 2 MB no upload de capa em `src/pages/AdminMusicas.tsx`.

## Mudanças

1. **Remover bloco de validação** (linhas 100-103):
   ```ts
   if (file.size > 2 * 1024 * 1024) { ... return; }
   ```
2. **Remover texto** "PNG/JPG até 2 MB" no label de upload (linha 448).

O bucket `musicas-capas` no Supabase Storage já está sem `file_size_limit` configurado, então não é preciso migration.