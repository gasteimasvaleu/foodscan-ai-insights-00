
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create workout_content table
CREATE TABLE public.workout_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  duration INTEGER, -- duration in minutes
  calories INTEGER, -- estimated calories burned
  content_type TEXT NOT NULL CHECK (content_type IN ('workout', 'tip')),
  video_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on workout_content
ALTER TABLE public.workout_content ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert user roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update user roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete user roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for workout_content
CREATE POLICY "Anyone can view active workout content"
  ON public.workout_content
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can insert workout content"
  ON public.workout_content
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update workout content"
  ON public.workout_content
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete workout content"
  ON public.workout_content
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_workout_content_updated_at
  BEFORE UPDATE ON public.workout_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample workout content
INSERT INTO public.workout_content (title, description, activity_type, duration, calories, content_type, video_url, thumbnail_url) VALUES
('Treino HIIT para Iniciantes', 'Um treino de alta intensidade perfeito para quem está começando. Combina exercícios de cardio e força.', 'HIIT', 20, 200, 'workout', 'https://example.com/video1', 'https://example.com/thumb1'),
('Yoga Matinal', 'Sequência de yoga para começar o dia com energia e flexibilidade.', 'Yoga', 30, 100, 'workout', 'https://example.com/video2', 'https://example.com/thumb2'),
('Dica: Hidratação Durante o Treino', 'A importância de se manter hidratado durante os exercícios e como fazer isso corretamente.', 'Dicas', NULL, NULL, 'tip', NULL, 'https://example.com/thumb3'),
('Treino de Força em Casa', 'Exercícios de musculação que você pode fazer em casa sem equipamentos.', 'Musculação', 45, 300, 'workout', 'https://example.com/video4', 'https://example.com/thumb4'),
('Corrida para Iniciantes', 'Guia completo para começar a correr, desde o aquecimento até a técnica de corrida.', 'Cardio', 25, 250, 'workout', 'https://example.com/video5', 'https://example.com/thumb5'),
('Dica: Recuperação Muscular', 'Como acelerar a recuperação muscular após treinos intensos.', 'Dicas', NULL, NULL, 'tip', NULL, 'https://example.com/thumb6');
