ALTER TABLE public.venue_interactions DROP CONSTRAINT venue_interactions_type_check;
ALTER TABLE public.venue_interactions ADD CONSTRAINT venue_interactions_type_check
  CHECK (type = ANY (ARRAY['poke','drink','found_you','flirt','sit_table','pay_bill']));