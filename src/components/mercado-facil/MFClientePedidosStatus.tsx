import { useState } from "react";
import { ChevronDown, Loader2, MapPin, Package } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useMFEntregas } from "@/hooks/mercado-facil/useMFEntregas";
import { MFEntregaProgress } from "./MFEntregaProgress";
import { formatBRL } from "@/lib/mercado-facil/formatters";

export function MFClientePedidosStatus() {
  const { user } = useAuthContext();
  const { entregas } = useMFEntregas({
    scope: "cliente-ativas",
    userId: user?.id,
  });
  const [open, setOpen] = useState(false);

  if (!user || entregas.length === 0) return null;

  return (
    <div className="bg-white border border-[#FD46A1]/30 rounded-3xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mf-status-pedidos"
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-base text-foreground">
          <Package size={16} className="text-[#FD46A1]" />
          Ver status do pedido
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD1E7] text-[#FD46A1]">
            {entregas.length}
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`text-[#FD46A1] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id="mf-status-pedidos"
        className={`transition-all duration-300 ease-out overflow-hidden ${
          open ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-3 border-t border-[#FD46A1]/15 pt-3">
          {entregas.map((e) => (
            <div key={e.id} className="bg-[#FFD1E7]/40 rounded-2xl p-3 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-[#FD46A1] mt-0.5 shrink-0" />
                <p className="text-sm flex-1">{e.endereco_entrega}</p>
                <span className="text-sm font-bold text-[#FD46A1] whitespace-nowrap">
                  {e.taxa_centavos > 0 ? formatBRL(e.taxa_centavos) : "A combinar"}
                </span>
              </div>

              {e.status === "disponivel" ? (
                <div className="flex items-center gap-2 text-xs text-foreground/70 pl-6">
                  <Loader2 size={12} className="animate-spin text-[#FD46A1]" />
                  Buscando entregador…
                </div>
              ) : (
                <MFEntregaProgress status={e.status as "aceita" | "coletada" | "entregue"} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
