-- Update existing phone numbers to international format
UPDATE whatsapp_subscriptions
SET phone_number = CASE
  -- Already has +55 prefix (correct format)
  WHEN phone_number ~ '^\+55\d{11}$' THEN phone_number
  -- Has 55 prefix without + (add +)
  WHEN phone_number ~ '^55\d{11}$' THEN '+' || phone_number
  -- Has only DDD + number (11 digits), add +55
  WHEN phone_number ~ '^\d{11}$' THEN '+55' || phone_number
  -- Has formatted number like (83) 98861-5781, extract and format
  WHEN phone_number ~ '^\(\d{2}\)\s*\d{4,5}-?\d{4}$' THEN 
    '+55' || regexp_replace(phone_number, '[^\d]', '', 'g')
  -- Default: try to clean and add +55
  ELSE '+55' || regexp_replace(phone_number, '[^\d]', '', 'g')
END
WHERE phone_number !~ '^\+55\d{11}$';

-- Add constraint to ensure phone numbers always have correct format
ALTER TABLE whatsapp_subscriptions
ADD CONSTRAINT phone_number_format_check 
CHECK (phone_number ~ '^\+\d{10,15}$');