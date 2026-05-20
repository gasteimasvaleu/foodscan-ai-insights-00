export type MFVeiculo = "moto" | "carro" | "bicicleta" | "a_pe";
export type MFEntregadorStatus = "pendente" | "aprovado" | "recusado" | "suspenso";
export type MFEntregaStatus = "disponivel" | "aceita" | "coletada" | "entregue" | "cancelada";

export interface MFEntregador {
  id: string;
  user_id: string;
  nome_completo: string;
  telefone_whatsapp: string;
  cidade: string;
  estado: string;
  veiculo: MFVeiculo;
  documento: string | null;
  cnh_url: string | null;
  foto_url: string | null;
  raio_atendimento_km: number;
  status: MFEntregadorStatus;
  disponivel: boolean;
  avaliacao_media: number;
  total_entregas: number;
  created_at: string;
  updated_at: string;
}

export interface MFEntrega {
  id: string;
  order_log_id: string | null;
  loja_id: string;
  lojista_id: string;
  cliente_id: string;
  entregador_id: string | null;
  endereco_entrega: string;
  cidade: string;
  taxa_centavos: number;
  status: MFEntregaStatus;
  telefone_cliente: string | null;
  telefone_lojista: string | null;
  aceita_em: string | null;
  coletada_em: string | null;
  entregue_em: string | null;
  created_at: string;
  updated_at: string;
}

export const VEICULO_LABEL: Record<MFVeiculo, string> = {
  moto: "Moto",
  carro: "Carro",
  bicicleta: "Bicicleta",
  a_pe: "A pé",
};

export const ENTREGA_STATUS_LABEL: Record<MFEntregaStatus, string> = {
  disponivel: "Disponível",
  aceita: "Aceita",
  coletada: "Coletada",
  entregue: "Entregue",
  cancelada: "Cancelada",
};
