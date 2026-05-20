
-- ============ Tabelas ============

CREATE TABLE public.mf_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon_emoji text DEFAULT '🛒',
  parent_id uuid REFERENCES public.mf_categorias(id) ON DELETE SET NULL,
  "order" int NOT NULL DEFAULT 100,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mf_lojas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  descricao text,
  foto_url text,
  banner_url text,
  telefone_whatsapp text NOT NULL,
  endereco jsonb DEFAULT '{}'::jsonb,
  horario_funcionamento jsonb DEFAULT '{}'::jsonb,
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mf_lojas_owner_idx ON public.mf_lojas(owner_id);
CREATE INDEX mf_lojas_ativa_idx ON public.mf_lojas(ativa);

CREATE TABLE public.mf_produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id uuid NOT NULL REFERENCES public.mf_lojas(id) ON DELETE CASCADE,
  categoria_id uuid REFERENCES public.mf_categorias(id) ON DELETE SET NULL,
  nome text NOT NULL,
  descricao text,
  preco_centavos int NOT NULL DEFAULT 0,
  preco_promo_centavos int,
  foto_url text,
  unidade text NOT NULL DEFAULT 'un',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mf_produtos_loja_idx ON public.mf_produtos(loja_id);
CREATE INDEX mf_produtos_categoria_idx ON public.mf_produtos(categoria_id);
CREATE INDEX mf_produtos_ativo_idx ON public.mf_produtos(ativo);

CREATE TABLE public.mf_favoritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  produto_id uuid NOT NULL REFERENCES public.mf_produtos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, produto_id)
);

CREATE TABLE public.mf_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  link text,
  "order" int NOT NULL DEFAULT 100,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.mf_order_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  loja_id uuid NOT NULL REFERENCES public.mf_lojas(id) ON DELETE CASCADE,
  itens jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_estimado_centavos int NOT NULL DEFAULT 0,
  sent_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX mf_order_log_loja_idx ON public.mf_order_log(loja_id, sent_at DESC);
CREATE INDEX mf_order_log_cliente_idx ON public.mf_order_log(cliente_id, sent_at DESC);

-- ============ Triggers de updated_at ============

CREATE TRIGGER mf_categorias_set_updated BEFORE UPDATE ON public.mf_categorias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER mf_lojas_set_updated BEFORE UPDATE ON public.mf_lojas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER mf_produtos_set_updated BEFORE UPDATE ON public.mf_produtos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER mf_banners_set_updated BEFORE UPDATE ON public.mf_banners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ RLS ============

ALTER TABLE public.mf_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mf_lojas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mf_produtos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mf_favoritos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mf_banners    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mf_order_log  ENABLE ROW LEVEL SECURITY;

-- Categorias
CREATE POLICY mf_categorias_select_all ON public.mf_categorias FOR SELECT USING (ativo = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY mf_categorias_admin_all  ON public.mf_categorias FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Banners
CREATE POLICY mf_banners_select_all ON public.mf_banners FOR SELECT USING (ativo = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY mf_banners_admin_all  ON public.mf_banners FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Lojas
CREATE POLICY mf_lojas_select_public ON public.mf_lojas FOR SELECT
  USING (ativa = true OR owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY mf_lojas_insert_pro ON public.mf_lojas FOR INSERT
  WITH CHECK (
    owner_id = auth.uid() AND (
      public.has_role(auth.uid(), 'admin') OR
      EXISTS (SELECT 1 FROM public.subscribers s WHERE s.user_id = auth.uid() AND s.subscribed = true)
    )
  );

CREATE POLICY mf_lojas_update_owner ON public.mf_lojas FOR UPDATE
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY mf_lojas_delete_owner ON public.mf_lojas FOR DELETE
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Produtos
CREATE POLICY mf_produtos_select_public ON public.mf_produtos FOR SELECT
  USING (
    ativo = true
    OR EXISTS (SELECT 1 FROM public.mf_lojas l WHERE l.id = loja_id AND l.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY mf_produtos_owner_write ON public.mf_produtos FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.mf_lojas l WHERE l.id = loja_id AND l.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.mf_lojas l WHERE l.id = loja_id AND l.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Favoritos
CREATE POLICY mf_favoritos_own ON public.mf_favoritos FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Order log
CREATE POLICY mf_order_log_select ON public.mf_order_log FOR SELECT
  USING (
    cliente_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.mf_lojas l WHERE l.id = loja_id AND l.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY mf_order_log_insert_self ON public.mf_order_log FOR INSERT
  WITH CHECK (cliente_id = auth.uid());

-- ============ Storage ============

INSERT INTO storage.buckets (id, name, public)
VALUES ('mercado-facil-produtos', 'mercado-facil-produtos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY mf_storage_select_all ON storage.objects FOR SELECT
  USING (bucket_id = 'mercado-facil-produtos');

CREATE POLICY mf_storage_insert_auth ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'mercado-facil-produtos' AND auth.uid() IS NOT NULL);

CREATE POLICY mf_storage_update_owner ON storage.objects FOR UPDATE
  USING (bucket_id = 'mercado-facil-produtos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY mf_storage_delete_owner ON storage.objects FOR DELETE
  USING (bucket_id = 'mercado-facil-produtos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============ Seed inicial de categorias ============

INSERT INTO public.mf_categorias (name, slug, icon_emoji, "order") VALUES
  ('Hortifrúti', 'hortifruti', '🥦', 10),
  ('Carnes e Aves', 'carnes-aves', '🥩', 20),
  ('Laticínios e Ovos', 'laticinios-ovos', '🥛', 30),
  ('Padaria', 'padaria', '🥖', 40),
  ('Mercearia', 'mercearia', '🍝', 50),
  ('Congelados', 'congelados', '🧊', 60),
  ('Bebidas', 'bebidas', '🥤', 70),
  ('Higiene', 'higiene', '🧴', 80),
  ('Limpeza', 'limpeza', '🧽', 90),
  ('Pet', 'pet', '🐾', 100)
ON CONFLICT (slug) DO NOTHING;
