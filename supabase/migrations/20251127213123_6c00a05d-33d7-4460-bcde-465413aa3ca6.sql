-- Add basal_metabolic_rate column to profiles table
ALTER TABLE profiles 
ADD COLUMN basal_metabolic_rate integer DEFAULT 0;