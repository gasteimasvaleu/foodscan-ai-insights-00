
ALTER TABLE public.venue_interactions
  ADD COLUMN IF NOT EXISTS hidden_for_sender boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_for_receiver boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "interactions update" ON public.venue_interactions;

CREATE POLICY "interactions update receiver"
ON public.venue_interactions
FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "interactions update sender"
ON public.venue_interactions
FOR UPDATE
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);
