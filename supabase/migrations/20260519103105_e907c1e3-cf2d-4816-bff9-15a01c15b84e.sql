
-- 1. TABELAS
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('bar','restaurante','festa','balada')),
  city TEXT NOT NULL,
  address TEXT,
  photo_url TEXT,
  description TEXT,
  rules TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_venues_owner ON public.venues(owner_id);
CREATE INDEX idx_venues_status ON public.venues(status, is_active);
CREATE INDEX idx_venues_category ON public.venues(category);
CREATE INDEX idx_venues_city ON public.venues(city);

CREATE TABLE public.venue_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_mode TEXT NOT NULL DEFAULT 'real' CHECK (display_mode IN ('real','anonymous')),
  display_alias TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(venue_id, user_id)
);
CREATE INDEX idx_venue_memberships_venue ON public.venue_memberships(venue_id);
CREATE INDEX idx_venue_memberships_user ON public.venue_memberships(user_id);

CREATE TABLE public.venue_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(venue_id, user_id)
);
CREATE INDEX idx_venue_bans_venue_user ON public.venue_bans(venue_id, user_id);

CREATE TABLE public.venue_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_mystery_tip BOOLEAN NOT NULL DEFAULT false,
  mystery_hint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_venue_messages_venue_created ON public.venue_messages(venue_id, created_at DESC);

CREATE TABLE public.venue_presence (
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (venue_id, user_id)
);
CREATE INDEX idx_venue_presence_last_seen ON public.venue_presence(venue_id, last_seen DESC);

CREATE TABLE public.venue_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('poke','drink','found_you')),
  emoji TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','seen')),
  dm_conversation_id UUID REFERENCES public.dm_conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_venue_interactions_receiver ON public.venue_interactions(receiver_id, created_at DESC);
CREATE INDEX idx_venue_interactions_sender ON public.venue_interactions(sender_id, created_at DESC);
CREATE INDEX idx_venue_interactions_venue ON public.venue_interactions(venue_id, created_at DESC);

CREATE TABLE public.venue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.venue_messages(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_venue_reports_venue ON public.venue_reports(venue_id, status);

-- 2. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_venue_member(_venue_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.venue_memberships WHERE venue_id = _venue_id AND user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_venue_banned(_venue_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.venue_bans
    WHERE venue_id = _venue_id AND user_id = _user_id
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_venue(_venue_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (
    EXISTS (SELECT 1 FROM public.venues WHERE id = _venue_id AND owner_id = _user_id)
    OR public.is_venue_member(_venue_id, _user_id)
  ) AND NOT public.is_venue_banned(_venue_id, _user_id);
$$;

CREATE OR REPLACE FUNCTION public.get_venue_online_count(_venue_id UUID)
RETURNS INTEGER LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*)::INTEGER FROM public.venue_presence
  WHERE venue_id = _venue_id AND last_seen > now() - INTERVAL '5 minutes';
$$;

-- 3. RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venues public approved select" ON public.venues
  FOR SELECT USING (status = 'approved' AND is_active = true);
CREATE POLICY "venues owner select" ON public.venues
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "venues admin select" ON public.venues
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "venues authenticated insert" ON public.venues
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "venues owner update" ON public.venues
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "venues admin update" ON public.venues
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "venues owner delete" ON public.venues
  FOR DELETE USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.venue_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memberships select" ON public.venue_memberships
  FOR SELECT USING (
    auth.uid() = user_id
    OR public.is_venue_member(venue_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_memberships.venue_id AND v.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "memberships self insert" ON public.venue_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "memberships self update" ON public.venue_memberships
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "memberships self delete" ON public.venue_memberships
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.venue_bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bans select" ON public.venue_bans
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_bans.venue_id AND v.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "bans owner manage" ON public.venue_bans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_bans.venue_id AND v.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_bans.venue_id AND v.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

ALTER TABLE public.venue_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "venue messages select" ON public.venue_messages
  FOR SELECT USING (public.can_access_venue(venue_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "venue messages insert" ON public.venue_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.can_access_venue(venue_id, auth.uid()));
CREATE POLICY "venue messages delete" ON public.venue_messages
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_messages.venue_id AND v.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

ALTER TABLE public.venue_presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "presence select" ON public.venue_presence
  FOR SELECT USING (public.can_access_venue(venue_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "presence self insert" ON public.venue_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "presence self update" ON public.venue_presence
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "presence self delete" ON public.venue_presence
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.venue_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interactions select" ON public.venue_interactions
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "interactions insert" ON public.venue_interactions
  FOR INSERT WITH CHECK (auth.uid() = sender_id AND public.can_access_venue(venue_id, auth.uid()));
CREATE POLICY "interactions update" ON public.venue_interactions
  FOR UPDATE USING (auth.uid() = receiver_id);

ALTER TABLE public.venue_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports select" ON public.venue_reports
  FOR SELECT USING (
    auth.uid() = reporter_id
    OR EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_reports.venue_id AND v.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "reports insert" ON public.venue_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id AND public.can_access_venue(venue_id, auth.uid()));
CREATE POLICY "reports update" ON public.venue_reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_reports.venue_id AND v.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- 4. TRIGGERS
CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.venue_messages_before_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  recent_count integer;
  bad_word text;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.venue_messages
  WHERE user_id = NEW.user_id AND created_at > now() - interval '60 seconds';
  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'rate_limit: aguarde alguns segundos antes de enviar mais mensagens';
  END IF;

  SELECT word INTO bad_word
  FROM public.chat_banned_words
  WHERE severity = 'block' AND NEW.content ~* ('\m' || word || '\M')
  LIMIT 1;
  IF bad_word IS NOT NULL THEN
    RAISE EXCEPTION 'blocked_word: sua mensagem contém termos não permitidos';
  END IF;

  IF NEW.content ~ '\m\d{2,5}[-.\s]?\d{4,5}[-.\s]?\d{4}\M' THEN
    RAISE EXCEPTION 'blocked_content: telefones não são permitidos';
  END IF;
  IF NEW.content ~* '(https?://|www\.)' THEN
    RAISE EXCEPTION 'blocked_content: links não são permitidos';
  END IF;
  IF NEW.content ~* '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' THEN
    RAISE EXCEPTION 'blocked_content: emails não são permitidos';
  END IF;

  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_venue_messages_before_insert
  BEFORE INSERT ON public.venue_messages
  FOR EACH ROW EXECUTE FUNCTION public.venue_messages_before_insert();

CREATE OR REPLACE FUNCTION public.venue_interactions_before_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  hour_count integer;
BEGIN
  SELECT count(*) INTO hour_count FROM public.venue_interactions
  WHERE sender_id = NEW.sender_id AND created_at > now() - interval '1 hour';
  IF hour_count >= 20 THEN
    RAISE EXCEPTION 'rate_limit: limite de 20 interações por hora atingido';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.venue_interactions
    WHERE sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id
      AND venue_id = NEW.venue_id AND created_at > now() - interval '30 seconds'
  ) THEN
    RAISE EXCEPTION 'cooldown: aguarde alguns segundos antes de interagir novamente';
  END IF;

  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_venue_interactions_before_insert
  BEFORE INSERT ON public.venue_interactions
  FOR EACH ROW EXECUTE FUNCTION public.venue_interactions_before_insert();

CREATE OR REPLACE FUNCTION public.venue_interactions_after_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  reverse_id uuid;
  _ua uuid;
  _ub uuid;
  _conv_id uuid;
BEGIN
  SELECT id INTO reverse_id FROM public.venue_interactions
  WHERE sender_id = NEW.receiver_id
    AND receiver_id = NEW.sender_id
    AND venue_id = NEW.venue_id
    AND type = NEW.type
    AND created_at > now() - interval '1 hour'
    AND id <> NEW.id
  ORDER BY created_at DESC LIMIT 1;

  IF reverse_id IS NOT NULL THEN
    IF NEW.sender_id < NEW.receiver_id THEN
      _ua := NEW.sender_id; _ub := NEW.receiver_id;
    ELSE
      _ua := NEW.receiver_id; _ub := NEW.sender_id;
    END IF;
    SELECT id INTO _conv_id FROM public.dm_conversations WHERE user_a = _ua AND user_b = _ub;
    IF _conv_id IS NULL THEN
      INSERT INTO public.dm_conversations (user_a, user_b) VALUES (_ua, _ub) RETURNING id INTO _conv_id;
    END IF;
    UPDATE public.venue_interactions SET dm_conversation_id = _conv_id WHERE id IN (NEW.id, reverse_id);
  END IF;

  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_venue_interactions_after_insert
  AFTER INSERT ON public.venue_interactions
  FOR EACH ROW EXECUTE FUNCTION public.venue_interactions_after_insert();

-- 5. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.venue_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.venue_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.venue_interactions;
ALTER TABLE public.venue_messages REPLICA IDENTITY FULL;
ALTER TABLE public.venue_presence REPLICA IDENTITY FULL;
ALTER TABLE public.venue_interactions REPLICA IDENTITY FULL;
