import { useEffect, useState } from "react";
import { Star, Bike } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { VEICULO_LABEL, type MFEntregador } from "@/lib/mercado-facil/entregador-types";
import { sendDeliveryRequestToWhatsApp } from "@/lib/mercado-facil/whatsapp";
import { formatBRL } from "@/lib/mercado-facil/formatters";
import { MFAddressConfirmDialog } from "@/components/mercado-facil/MFAddressConfirmDialog";
import type { MFCartItem, MFLoja } from "@/lib/mercado-facil/types";

function faixaPreco(min: number, max: number): string {
  if (!min && !max) return "Preço a combinar";
  if (min && max && min !== max) return `${formatBRL(min)} – ${formatBRL(max)}`;
  return formatBRL(min || max);
}

interface Props {
  loja: MFLoja;
  cidade: string;
  endereco: string;
  clienteId: string;
  clienteNome?: string;
  telefoneCliente?: string;
  itens: MFCartItem[];
  totalCentavos: number;
  orderLogId?: string;
  taxaOverrideCentavos?: number;
  onCalled?: () => void;
}

export function MFEntregadoresDisponiveis({
  loja, cidade, endereco, clienteId, clienteNome, telefoneCliente, itens, totalCentavos,
  orderLogId, taxaOverrideCentavos, onCalled,
}: Props) {
  const [entregadores, setEntregadores] = useState<MFEntregador[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState<string | null>(null);

  useEffect(() => {
    if (!cidade.trim()) {
      setEntregadores([]);
      return;
    }
    setLoading(true);
    supabase
      .rpc("mf_entregadores_disponiveis", { _cidade: cidade.trim() })
      .then(({ data }) => {
        setEntregadores((data as MFEntregador[]) ?? []);
        setLoading(false);
      });
  }, [cidade]);

  const handleChamar = async (entregador: MFEntregador) => {
    if (!endereco.trim() || !cidade.trim()) {
      toast({ title: "Informe a cidade e o endereço de entrega", variant: "destructive" });
      return;
    }
    setEnviando(entregador.id);
    try {
      await sendDeliveryRequestToWhatsApp({
        entregador, loja, clienteId, clienteNome, telefoneCliente,
        endereco, cidade, itens, totalCentavos,
        orderLogId, taxaOverrideCentavos,
      });
      toast({
        title: "WhatsApp aberto",
        description: `Aguarde o retorno de ${entregador.nome_completo}.`,
      });
      onCalled?.();
    } catch (err) {
      console.error(err);
      toast({ title: "Não foi possível chamar o entregador", variant: "destructive" });
    } finally {
      setEnviando(null);
    }
  };

  if (!cidade.trim()) {
    return (
      <p className="text-xs text-foreground/60 text-center">
        Informe a cidade acima para ver entregadores disponíveis.
      </p>
    );
  }

  if (loading) {
    return <p className="text-xs text-foreground/60 text-center">Buscando entregadores…</p>;
  }

  if (entregadores.length === 0) {
    return (
      <p className="text-xs text-foreground/60 text-center">
        Nenhum entregador disponível agora em {cidade}. Você pode combinar a retirada direto com a loja.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Entregadores disponíveis em {cidade}</p>
      <ul className="space-y-2">
        {entregadores.map((e) => (
          <li key={e.id} className="bg-[#FFD1E7] rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white overflow-hidden flex items-center justify-center shrink-0">
                {e.foto_url ? (
                  <img src={e.foto_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Bike size={20} className="text-[#FD46A1]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{e.nome_completo}</p>
                <p className="text-xs text-foreground/60 flex items-center gap-2 mt-0.5">
                  <span>{VEICULO_LABEL[e.veiculo]}</span>
                  <span className="text-foreground/30">•</span>
                  <span className="flex items-center gap-0.5">
                    <Star size={12} className="fill-[#FD46A1] text-[#FD46A1]" />
                    {Number(e.avaliacao_media ?? 0).toFixed(1)}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/60">
              <span className="bg-[#FD46A1] text-white text-[11px] px-2.5 py-1 rounded-full">
                {faixaPreco(e.taxa_min_centavos ?? 0, e.taxa_max_centavos ?? 0)}
              </span>
              <Button
                onClick={() => handleChamar(e)}
                disabled={enviando === e.id || !endereco.trim()}
                className="bg-[#25D366] hover:bg-[#25D366]/90 rounded-2xl h-9 px-5 text-sm text-white"
              >
                Chamar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
