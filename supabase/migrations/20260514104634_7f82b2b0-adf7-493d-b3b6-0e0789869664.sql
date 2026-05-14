
-- ===== STORIES =====
CREATE TABLE public.community_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);
CREATE INDEX idx_community_stories_user ON public.community_stories(user_id);
CREATE INDEX idx_community_stories_expires ON public.community_stories(expires_at);

ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active stories"
  ON public.community_stories FOR SELECT TO authenticated
  USING (expires_at > now());

CREATE POLICY "Users insert their own stories"
  ON public.community_stories FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete their own stories"
  ON public.community_stories FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Story views
CREATE TABLE public.community_story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.community_stories(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (story_id, viewer_id)
);
CREATE INDEX idx_story_views_viewer ON public.community_story_views(viewer_id);
CREATE INDEX idx_story_views_story ON public.community_story_views(story_id);

ALTER TABLE public.community_story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own story views"
  ON public.community_story_views FOR SELECT TO authenticated
  USING (auth.uid() = viewer_id);

CREATE POLICY "Story authors see views of their stories"
  ON public.community_story_views FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.community_stories s WHERE s.id = story_id AND s.user_id = auth.uid()));

CREATE POLICY "Users insert their own story views"
  ON public.community_story_views FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = viewer_id);

-- ===== DMs =====
CREATE TABLE public.dm_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dm_conversations_user_order CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);
CREATE INDEX idx_dm_conversations_user_a ON public.dm_conversations(user_a, last_message_at DESC);
CREATE INDEX idx_dm_conversations_user_b ON public.dm_conversations(user_b, last_message_at DESC);

ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view conversations"
  ON public.dm_conversations FOR SELECT TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- DM messages
CREATE TABLE public.dm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.dm_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text,
  image_url text,
  storage_path text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (content IS NOT NULL OR image_url IS NOT NULL)
);
CREATE INDEX idx_dm_messages_conv ON public.dm_messages(conversation_id, created_at);

ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view messages"
  ON public.dm_messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.dm_conversations c
    WHERE c.id = conversation_id AND (auth.uid() = c.user_a OR auth.uid() = c.user_b)
  ));

CREATE POLICY "Sender can insert messages in own conversations"
  ON public.dm_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND EXISTS (
      SELECT 1 FROM public.dm_conversations c
      WHERE c.id = conversation_id AND (auth.uid() = c.user_a OR auth.uid() = c.user_b)
    )
  );

CREATE POLICY "Recipient can mark as read"
  ON public.dm_messages FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.dm_conversations c
    WHERE c.id = conversation_id AND (auth.uid() = c.user_a OR auth.uid() = c.user_b)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.dm_conversations c
    WHERE c.id = conversation_id AND (auth.uid() = c.user_a OR auth.uid() = c.user_b)
  ));

CREATE POLICY "Sender can delete own messages"
  ON public.dm_messages FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

-- get_or_create function
CREATE OR REPLACE FUNCTION public.get_or_create_dm_conversation(_other_user uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _me uuid := auth.uid();
  _ua uuid;
  _ub uuid;
  _id uuid;
BEGIN
  IF _me IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF _other_user IS NULL OR _other_user = _me THEN
    RAISE EXCEPTION 'invalid other user';
  END IF;
  IF _me < _other_user THEN
    _ua := _me; _ub := _other_user;
  ELSE
    _ua := _other_user; _ub := _me;
  END IF;
  SELECT id INTO _id FROM public.dm_conversations WHERE user_a = _ua AND user_b = _ub;
  IF _id IS NULL THEN
    INSERT INTO public.dm_conversations (user_a, user_b) VALUES (_ua, _ub) RETURNING id INTO _id;
  END IF;
  RETURN _id;
END;
$$;

-- trigger to update last_message_at
CREATE OR REPLACE FUNCTION public.touch_dm_conversation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.dm_conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_touch_dm_conversation
AFTER INSERT ON public.dm_messages
FOR EACH ROW EXECUTE FUNCTION public.touch_dm_conversation();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_story_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_conversations;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('community-stories', 'community-stories', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('dm-media', 'dm-media', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: community-stories (public bucket, owner upload)
CREATE POLICY "Stories images public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'community-stories');

CREATE POLICY "Stories owner upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'community-stories' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Stories owner delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'community-stories' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies: dm-media (private — sender uploads under own folder; reads via signed URLs)
CREATE POLICY "DM media owner upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'dm-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "DM media owner read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'dm-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "DM media owner delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'dm-media' AND auth.uid()::text = (storage.foldername(name))[1]);
