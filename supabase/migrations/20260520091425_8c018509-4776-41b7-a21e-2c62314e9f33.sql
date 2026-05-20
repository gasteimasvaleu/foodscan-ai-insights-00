
DO $$ BEGIN
  CREATE TYPE public.mf_entregador_veiculo AS ENUM ('moto','carro','bicicleta','a_pe');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.mf_entregador_status AS ENUM ('pendente','aprovado','recusado','suspenso');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.mf_entrega_status AS ENUM ('disponivel','aceita','coletada','entregue','cancelada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.mf_lojas
  ADD COLUMN IF NOT EXISTS aceita_entregador boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS taxa_entrega_padrao_centavos integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.mf_entregadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  nome_completo text NOT NULL,
  telefone_whatsapp text NOT NULL,
  cidade text NOT NULL,
  estado text NOT NULL,
  veiculo public.mf_entregador_veiculo NOT NULL DEFAULT 'moto',
  documento text,
  cnh_url text,
  foto_url text,
  raio_atendimento_km integer NOT NULL DEFAULT 5,
  status public.mf_entregador_status NOT NULL DEFAULT 'pendente',
  disponivel boolean NOT NULL DEFAULT false,
  avaliacao_media numeric(3,2) NOT NULL DEFAULT 0,
  total_entregas integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mf_entregadores_status ON public.mf_entregadores(status);
CREATE INDEX IF NOT EXISTS idx_mf_entregadores_cidade ON public.mf_entregadores(cidade);
ALTER TABLE public.mf_entregadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Entregador vê próprio cadastro" ON public.mf_entregadores;
CREATE POLICY "Entregador vê próprio cadastro" ON public.mf_entregadores
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Entregador cria próprio cadastro" ON public.mf_entregadores;
CREATE POLICY "Entregador cria próprio cadastro" ON public.mf_entregadores
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Entregador edita próprio cadastro" ON public.mf_entregadores;
CREATE POLICY "Entregador edita próprio cadastro" ON public.mf_entregadores
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admin deleta entregador" ON public.mf_entregadores;
CREATE POLICY "Admin deleta entregador" ON public.mf_entregadores
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

DROP TRIGGER IF EXISTS trg_mf_entregadores_updated_at ON public.mf_entregadores;
CREATE TRIGGER trg_mf_entregadores_updated_at
  BEFORE UPDATE ON public.mf_entregadores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.mf_entregas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_log_id uuid REFERENCES public.mf_order_log(id) ON DELETE SET NULL,
  loja_id uuid NOT NULL REFERENCES public.mf_lojas(id) ON DELETE CASCADE,
  lojista_id uuid NOT NULL,
  cliente_id uuid NOT NULL,
  entregador_id uuid REFERENCES public.mf_entregadores(id) ON DELETE SET NULL,
  endereco_entrega text NOT NULL,
  cidade text NOT NULL,
  taxa_centavos integer NOT NULL DEFAULT 0,
  status public.mf_entrega_status NOT NULL DEFAULT 'disponivel',
  telefone_cliente text,
  telefone_lojista text,
  aceita_em timestamptz,
  coletada_em timestamptz,
  entregue_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mf_entregas_status ON public.mf_entregas(status);
CREATE INDEX IF NOT EXISTS idx_mf_entregas_cidade ON public.mf_entregas(cidade);
CREATE INDEX IF NOT EXISTS idx_mf_entregas_lojista ON public.mf_entregas(lojista_id);
CREATE INDEX IF NOT EXISTS idx_mf_entregas_entregador ON public.mf_entregas(entregador_id);
ALTER TABLE public.mf_entregas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lojista cria entrega" ON public.mf_entregas;
CREATE POLICY "Lojista cria entrega" ON public.mf_entregas
  FOR INSERT TO authenticated WITH CHECK (
    lojista_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.mf_lojas l WHERE l.id = loja_id AND l.owner_id = auth.uid())
  );
DROP POLICY IF EXISTS "Ver entregas" ON public.mf_entregas;
CREATE POLICY "Ver entregas" ON public.mf_entregas
  FOR SELECT TO authenticated USING (
    lojista_id = auth.uid()
    OR cliente_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.mf_entregadores e WHERE e.id = mf_entregas.entregador_id AND e.user_id = auth.uid())
    OR (
      status = 'disponivel'
      AND EXISTS (
        SELECT 1 FROM public.mf_entregadores e
        WHERE e.user_id = auth.uid() AND e.status = 'aprovado' AND e.disponivel = true AND e.cidade = mf_entregas.cidade
      )
    )
    OR public.has_role(auth.uid(),'admin')
  );
DROP POLICY IF EXISTS "Atualizar entrega" ON public.mf_entregas;
CREATE POLICY "Atualizar entrega" ON public.mf_entregas
  FOR UPDATE TO authenticated USING (
    lojista_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.mf_entregadores e WHERE e.id = mf_entregas.entregador_id AND e.user_id = auth.uid())
    OR (
      status = 'disponivel'
      AND EXISTS (
        SELECT 1 FROM public.mf_entregadores e
        WHERE e.user_id = auth.uid() AND e.status = 'aprovado' AND e.disponivel = true AND e.cidade = mf_entregas.cidade
      )
    )
    OR public.has_role(auth.uid(),'admin')
  );
DROP POLICY IF EXISTS "Lojista deleta entrega" ON public.mf_entregas;
CREATE POLICY "Lojista deleta entrega" ON public.mf_entregas
  FOR DELETE TO authenticated USING (lojista_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

DROP TRIGGER IF EXISTS trg_mf_entregas_updated_at ON public.mf_entregas;
CREATE TRIGGER trg_mf_entregas_updated_at
  BEFORE UPDATE ON public.mf_entregas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.mf_entregador_avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entrega_id uuid REFERENCES public.mf_entregas(id) ON DELETE CASCADE,
  entregador_id uuid NOT NULL REFERENCES public.mf_entregadores(id) ON DELETE CASCADE,
  autor_id uuid NOT NULL,
  nota integer NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mf_aval_entregador ON public.mf_entregador_avaliacoes(entregador_id);
ALTER TABLE public.mf_entregador_avaliacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver avaliações" ON public.mf_entregador_avaliacoes;
CREATE POLICY "Ver avaliações" ON public.mf_entregador_avaliacoes
  FOR SELECT TO authenticated USING (
    autor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.mf_entregadores e WHERE e.id = entregador_id AND e.user_id = auth.uid())
    OR public.has_role(auth.uid(),'admin')
  );
DROP POLICY IF EXISTS "Criar avaliação" ON public.mf_entregador_avaliacoes;
CREATE POLICY "Criar avaliação" ON public.mf_entregador_avaliacoes
  FOR INSERT TO authenticated WITH CHECK (
    autor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.mf_entregas en
      WHERE en.id = entrega_id AND (en.cliente_id = auth.uid() OR en.lojista_id = auth.uid())
    )
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('mercado-facil-entregadores', 'mercado-facil-entregadores', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Entregador lê próprios arquivos" ON storage.objects;
CREATE POLICY "Entregador lê próprios arquivos" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'mercado-facil-entregadores'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin'))
  );
DROP POLICY IF EXISTS "Entregador envia próprios arquivos" ON storage.objects;
CREATE POLICY "Entregador envia próprios arquivos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'mercado-facil-entregadores' AND auth.uid()::text = (storage.foldername(name))[1]
  );
DROP POLICY IF EXISTS "Entregador atualiza próprios arquivos" ON storage.objects;
CREATE POLICY "Entregador atualiza próprios arquivos" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'mercado-facil-entregadores' AND auth.uid()::text = (storage.foldername(name))[1]
  );
DROP POLICY IF EXISTS "Entregador deleta próprios arquivos" ON storage.objects;
CREATE POLICY "Entregador deleta próprios arquivos" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'mercado-facil-entregadores'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(),'admin'))
  );
