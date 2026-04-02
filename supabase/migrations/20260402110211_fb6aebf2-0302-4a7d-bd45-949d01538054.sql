
-- Update default value for preferences column
ALTER TABLE public.whatsapp_subscriptions 
ALTER COLUMN preferences SET DEFAULT '{"reminders": true, "fasting_notification": true, "weekly_objectives": true, "motivational": true}'::jsonb;

-- Backfill existing records with new keys (preserve existing values)
UPDATE public.whatsapp_subscriptions
SET preferences = COALESCE(preferences, '{}'::jsonb) 
  || jsonb_build_object(
    'reminders', COALESCE((preferences->>'reminders')::boolean, true),
    'fasting_notification', COALESCE((preferences->>'fasting_notification')::boolean, true),
    'weekly_objectives', COALESCE((preferences->>'weekly_objectives')::boolean, true),
    'motivational', COALESCE((preferences->>'motivational')::boolean, true)
  );
