-- Add name and email columns to nutritionist_ads
ALTER TABLE public.nutritionist_ads 
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS email text;

-- Make user_id nullable to allow ads without authentication
ALTER TABLE public.nutritionist_ads 
ALTER COLUMN user_id DROP NOT NULL;

-- Set default values for existing rows
UPDATE public.nutritionist_ads 
SET name = COALESCE(name, 'Nutricionista'),
    email = COALESCE(email, 'contato@exemplo.com')
WHERE name IS NULL OR email IS NULL;

-- Set NOT NULL constraints on new columns
ALTER TABLE public.nutritionist_ads 
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN email SET NOT NULL;

-- Update RLS policy to allow anyone to create ads
DROP POLICY IF EXISTS "Users can create their own ads" ON public.nutritionist_ads;

CREATE POLICY "Anyone can create ads"
ON public.nutritionist_ads
FOR INSERT
TO public
WITH CHECK (true);