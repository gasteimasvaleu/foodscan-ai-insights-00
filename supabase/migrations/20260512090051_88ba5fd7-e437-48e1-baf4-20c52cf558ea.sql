
-- Chat global em tempo real
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view non-deleted messages"
  ON public.chat_messages FOR SELECT TO authenticated
  USING (is_deleted = false OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own messages"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages or admins"
  ON public.chat_messages FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own messages or admins"
  ON public.chat_messages FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Lista de palavras banidas
CREATE TABLE public.chat_banned_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL UNIQUE,
  severity text NOT NULL DEFAULT 'block' CHECK (severity IN ('block','warn')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_banned_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read banned words"
  ON public.chat_banned_words FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can insert banned words"
  ON public.chat_banned_words FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update banned words"
  ON public.chat_banned_words FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete banned words"
  ON public.chat_banned_words FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Denúncias
CREATE TABLE public.chat_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, reporter_id)
);
ALTER TABLE public.chat_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own reports"
  ON public.chat_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON public.chat_reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update reports"
  ON public.chat_reports FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete reports"
  ON public.chat_reports FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger: filtro de palavrões + rate limit (10 msgs / 60s)
CREATE OR REPLACE FUNCTION public.chat_messages_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
  bad_word text;
BEGIN
  -- Rate limit
  SELECT count(*) INTO recent_count
  FROM public.chat_messages
  WHERE user_id = NEW.user_id
    AND created_at > now() - interval '60 seconds';
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'rate_limit: aguarde alguns segundos antes de enviar mais mensagens';
  END IF;

  -- Filtro de palavrões (case-insensitive, palavra inteira)
  SELECT word INTO bad_word
  FROM public.chat_banned_words
  WHERE severity = 'block'
    AND NEW.content ~* ('\m' || word || '\M')
  LIMIT 1;
  IF bad_word IS NOT NULL THEN
    RAISE EXCEPTION 'blocked_word: sua mensagem contém termos não permitidos';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_chat_messages_before_insert
BEFORE INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.chat_messages_before_insert();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Seed de palavrões PT-BR (lista básica)
INSERT INTO public.chat_banned_words (word) VALUES
  ('porra'),('caralho'),('merda'),('puta'),('puto'),('cuzao'),('cuzão'),
  ('viado'),('viadinho'),('bicha'),('boiola'),('vagabunda'),('vagabundo'),
  ('arrombado'),('arrombada'),('fdp'),('filho da puta'),('cu'),('buceta'),
  ('xota'),('rola'),('piroca'),('punheta'),('foder'),('fodase'),('fodase'),
  ('retardado'),('retardada'),('mongoloide'),('mongolóide'),('aborto'),
  ('preto safado'),('macaco'),('macaca'),('negao'),('negão'),
  ('corno'),('corna'),('chupa'),('gozar'),('siririca'),('xoxota')
ON CONFLICT (word) DO NOTHING;
