-- Coluna receipt_url
ALTER TABLE public.finance_transactions
  ADD COLUMN IF NOT EXISTS receipt_url text;

-- Bucket público para comprovantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('finance-receipts', 'finance-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Policies: leitura pública; escrita restrita ao dono (path prefix = auth.uid())
DROP POLICY IF EXISTS "finance_receipts_public_read" ON storage.objects;
CREATE POLICY "finance_receipts_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'finance-receipts');

DROP POLICY IF EXISTS "finance_receipts_owner_insert" ON storage.objects;
CREATE POLICY "finance_receipts_owner_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'finance-receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "finance_receipts_owner_update" ON storage.objects;
CREATE POLICY "finance_receipts_owner_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'finance-receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "finance_receipts_owner_delete" ON storage.objects;
CREATE POLICY "finance_receipts_owner_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'finance-receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);