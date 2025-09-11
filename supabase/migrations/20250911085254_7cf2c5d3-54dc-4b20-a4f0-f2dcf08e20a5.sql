-- Create weekly_summaries table for persistent weekly data
CREATE TABLE IF NOT EXISTS public.weekly_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  carbohydrates NUMERIC NOT NULL DEFAULT 0,
  proteins NUMERIC NOT NULL DEFAULT 0,
  fats NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own weekly summaries" 
ON public.weekly_summaries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly summaries" 
ON public.weekly_summaries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly summaries" 
ON public.weekly_summaries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly summaries" 
ON public.weekly_summaries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_weekly_summaries_updated_at
BEFORE UPDATE ON public.weekly_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_date ON public.weekly_summaries(user_id, date DESC);