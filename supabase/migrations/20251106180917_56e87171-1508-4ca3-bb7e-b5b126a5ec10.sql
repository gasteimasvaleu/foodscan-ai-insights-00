-- Adicionar flag de proteção para assinaturas Hotmart
ALTER TABLE subscribers 
ADD COLUMN is_hotmart_managed BOOLEAN DEFAULT FALSE;

-- Criar índice para melhorar performance das queries
CREATE INDEX idx_subscribers_is_hotmart_managed ON subscribers(is_hotmart_managed);

-- Atualizar registros Hotmart existentes
UPDATE subscribers 
SET is_hotmart_managed = TRUE 
WHERE payment_provider = 'hotmart' AND hotmart_transaction_id IS NOT NULL;