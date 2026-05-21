CREATE TABLE public.playlists_musicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  categoria text NOT NULL CHECK (categoria IN ('foco','relaxar','treino','refeicao','sono')),
  youtube_id text NOT NULL,
  youtube_type text NOT NULL DEFAULT 'playlist' CHECK (youtube_type IN ('playlist','video')),
  thumbnail_url text,
  ordem integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.playlists_musicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playlists_musicas_select_ativas"
  ON public.playlists_musicas FOR SELECT
  TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "playlists_musicas_admin_insert"
  ON public.playlists_musicas FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "playlists_musicas_admin_update"
  ON public.playlists_musicas FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "playlists_musicas_admin_delete"
  ON public.playlists_musicas FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER playlists_musicas_set_updated_at
  BEFORE UPDATE ON public.playlists_musicas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_playlists_musicas_categoria_ordem
  ON public.playlists_musicas (categoria, ordem, created_at DESC)
  WHERE is_active = true;