export interface MFCategoria {
  id: string;
  name: string;
  slug: string;
  icon_emoji: string | null;
  order: number;
  ativo: boolean;
}

export interface MFLoja {
  id: string;
  owner_id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  foto_url: string | null;
  banner_url: string | null;
  telefone_whatsapp: string;
  endereco: { cidade?: string; bairro?: string; rua?: string } | null;
  horario_funcionamento: Record<string, string> | null;
  ativa: boolean;
  aceita_entregador?: boolean;
  quem_aciona_entregador?: "loja" | "cliente";
  taxa_entrega_padrao_centavos?: number;
  created_at: string;
  updated_at: string;
}

export interface MFProduto {
  id: string;
  loja_id: string;
  categoria_id: string | null;
  nome: string;
  descricao: string | null;
  preco_centavos: number;
  preco_promo_centavos: number | null;
  foto_url: string | null;
  unidade: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MFCartItem {
  produto_id: string;
  loja_id: string;
  nome: string;
  preco_centavos: number;
  unidade: string;
  foto_url: string | null;
  quantidade: number;
}
