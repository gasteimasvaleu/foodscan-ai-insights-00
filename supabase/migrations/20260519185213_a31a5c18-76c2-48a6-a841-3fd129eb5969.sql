-- Tabela de palpites de identidade
CREATE TABLE public.venue_guesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  guess_text text NOT NULL CHECK (length(btrim(guess_text)) BETWEEN 1 AND 40),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','correct','wrong')),
  dm_conversation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  CHECK (sender_id <> receiver_id)
);

CREATE INDEX idx_venue_guesses_receiver ON public.venue_guesses(receiver_id, status);
CREATE INDEX idx_venue_guesses_pair ON public.venue_guesses(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_venue_guesses_venue ON public.venue_guesses(venue_id, created_at DESC);

ALTER TABLE public.venue_guesses ENABLE ROW LEVEL SECURITY;

-- RLS
CREATE POLICY "Sender can insert own guesses"
ON public.venue_guesses FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND sender_id <> receiver_id
  AND public.can_access_venue(venue_id, auth.uid())
  AND public.can_access_venue(venue_id, receiver_id)
);

CREATE POLICY "Participants can view guesses"
ON public.venue_guesses FOR SELECT TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Receiver can resolve guess"
ON public.venue_guesses FOR UPDATE TO authenticated
USING (auth.uid() = receiver_id AND status = 'pending')
WITH CHECK (auth.uid() = receiver_id AND status IN ('correct','wrong'));

-- Trigger before insert: rate limit, cooldown, filtros de conteúdo
CREATE OR REPLACE FUNCTION public.venue_guesses_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  hour_count integer;
  recent_pair timestamptz;
  bad_word text;
BEGIN
  -- Rate limit global do sender
  SELECT count(*) INTO hour_count FROM public.venue_guesses
  WHERE sender_id = NEW.sender_id AND created_at > now() - interval '1 hour';
  IF hour_count >= 20 THEN
    RAISE EXCEPTION 'rate_limit: limite de 20 palpites por hora atingido';
  END IF;

  -- Cooldown de 5 minutos por par sender->receiver
  SELECT created_at INTO recent_pair FROM public.venue_guesses
  WHERE sender_id = NEW.sender_id
    AND receiver_id = NEW.receiver_id
    AND venue_id = NEW.venue_id
    AND created_at > now() - interval '5 minutes'
  ORDER BY created_at DESC LIMIT 1;
  IF recent_pair IS NOT NULL THEN
    RAISE EXCEPTION 'cooldown: aguarde 5 minutos antes de tentar de novo com essa pessoa';
  END IF;

  -- Filtros de conteúdo
  SELECT word INTO bad_word
  FROM public.chat_banned_words
  WHERE severity = 'block' AND NEW.guess_text ~* ('\m' || word || '\M')
  LIMIT 1;
  IF bad_word IS NOT NULL THEN
    RAISE EXCEPTION 'blocked_word: palpite contém termos não permitidos';
  END IF;

  IF NEW.guess_text ~ '\m\d{2,5}[-.\s]?\d{4,5}[-.\s]?\d{4}\M' THEN
    RAISE EXCEPTION 'blocked_content: telefones não são permitidos';
  END IF;
  IF NEW.guess_text ~* '(https?://|www\.)' THEN
    RAISE EXCEPTION 'blocked_content: links não são permitidos';
  END IF;
  IF NEW.guess_text ~* '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' THEN
    RAISE EXCEPTION 'blocked_content: emails não são permitidos';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_venue_guesses_before_insert
BEFORE INSERT ON public.venue_guesses
FOR EACH ROW EXECUTE FUNCTION public.venue_guesses_before_insert();

-- Trigger after update: ao virar correct, cria DM e posta no chat público
CREATE OR REPLACE FUNCTION public.venue_guesses_after_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _ua uuid; _ub uuid; _conv_id uuid;
  _sender_alias text; _receiver_alias text;
BEGIN
  IF NEW.status = 'correct' AND OLD.status = 'pending' THEN
    -- Cria/reaproveita DM
    IF NEW.sender_id < NEW.receiver_id THEN
      _ua := NEW.sender_id; _ub := NEW.receiver_id;
    ELSE
      _ua := NEW.receiver_id; _ub := NEW.sender_id;
    END IF;
    SELECT id INTO _conv_id FROM public.dm_conversations WHERE user_a = _ua AND user_b = _ub;
    IF _conv_id IS NULL THEN
      INSERT INTO public.dm_conversations (user_a, user_b) VALUES (_ua, _ub) RETURNING id INTO _conv_id;
    END IF;

    -- Pega apelidos atuais respeitando display_mode
    SELECT CASE WHEN display_mode = 'anonymous' THEN COALESCE(display_alias,'Anônimo')
                ELSE COALESCE((SELECT name FROM public.profiles WHERE id = NEW.sender_id), 'Usuário') END
      INTO _sender_alias
    FROM public.venue_memberships WHERE venue_id = NEW.venue_id AND user_id = NEW.sender_id;

    SELECT CASE WHEN display_mode = 'anonymous' THEN COALESCE(display_alias,'Anônimo')
                ELSE COALESCE((SELECT name FROM public.profiles WHERE id = NEW.receiver_id), 'Usuário') END
      INTO _receiver_alias
    FROM public.venue_memberships WHERE venue_id = NEW.venue_id AND user_id = NEW.receiver_id;

    NEW.dm_conversation_id := _conv_id;
    NEW.resolved_at := now();

    -- Posta mensagem de match revelado no chat do venue (parseada no front pelo prefixo)
    INSERT INTO public.venue_messages (venue_id, user_id, content)
    VALUES (
      NEW.venue_id,
      NEW.sender_id,
      '__match_reveal__:' || COALESCE(_sender_alias,'Anônimo') || '|' || COALESCE(_receiver_alias,'Anônimo')
    );
  ELSIF NEW.status = 'wrong' AND OLD.status = 'pending' THEN
    NEW.resolved_at := now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_venue_guesses_before_update_resolve
BEFORE UPDATE ON public.venue_guesses
FOR EACH ROW EXECUTE FUNCTION public.venue_guesses_after_update();

-- Realtime
ALTER TABLE public.venue_guesses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.venue_guesses;

-- O INSERT do venue_messages feito pelo trigger acima precisa passar pelo before_insert do venue_messages
-- (que faz checks de conteúdo). Como o prefixo __match_reveal__ não contém telefone/email/link/palavrão,
-- ele passa naturalmente. O rate limit usa o sender_id real do palpite, sem violar limites normais.