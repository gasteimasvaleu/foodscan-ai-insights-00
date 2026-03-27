

## Fix: RLS error ao fazer upload de banner

### Causa

O erro "new row violates row-level security policy" vem do **bucket de storage `criativos`**. O bucket é público para leitura, mas não tem política de upload configurada. Quando o admin tenta fazer upload de uma imagem, o Supabase bloqueia a inserção no `storage.objects`.

### Solução

Criar uma **migration** adicionando políticas de storage no bucket `criativos` para permitir que usuários autenticados com role admin possam fazer upload e deletar arquivos:

```sql
-- Permitir admins fazerem upload no bucket criativos
CREATE POLICY "Admins can upload to criativos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'criativos' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Permitir admins deletarem do bucket criativos  
CREATE POLICY "Admins can delete from criativos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'criativos'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
```

### Arquivos alterados
- Nova migration SQL (apenas políticas de storage)
- Nenhuma alteração de código necessária

