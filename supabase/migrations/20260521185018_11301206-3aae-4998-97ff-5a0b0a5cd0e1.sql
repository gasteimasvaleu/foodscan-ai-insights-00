-- Tabela de faixas
CREATE TABLE public.musicas_faixas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id uuid NOT NULL REFERENCES public.playlists_musicas(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  audio_url text NOT NULL,
  duracao_segundos integer,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_musicas_faixas_playlist ON public.musicas_faixas(playlist_id, ordem);

ALTER TABLE public.musicas_faixas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faixas de playlists ativas são públicas"
ON public.musicas_faixas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.playlists_musicas p
    WHERE p.id = musicas_faixas.playlist_id AND p.is_active = true
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins inserem faixas"
ON public.musicas_faixas FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam faixas"
ON public.musicas_faixas FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins apagam faixas"
ON public.musicas_faixas FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Bucket de áudios
INSERT INTO storage.buckets (id, name, public)
VALUES ('musicas-audio', 'musicas-audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Áudios de músicas são públicos"
ON storage.objects FOR SELECT
USING (bucket_id = 'musicas-audio');

CREATE POLICY "Admins fazem upload de áudios"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'musicas-audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins atualizam áudios"
ON storage.objects FOR UPDATE
USING (bucket_id = 'musicas-audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins apagam áudios"
ON storage.objects FOR DELETE
USING (bucket_id = 'musicas-audio' AND public.has_role(auth.uid(), 'admin'));