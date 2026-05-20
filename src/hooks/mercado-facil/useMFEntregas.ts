import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MFEntrega, MFEntregaStatus } from "@/lib/mercado-facil/entregador-types";

interface UseEntregasArgs {
  scope: "lojista" | "entregador-disponivel" | "entregador-ativa" | "entregador-historico";
  userId?: string;
  entregadorId?: string;
  cidade?: string;
}

export function useMFEntregas({ scope, userId, entregadorId, cidade }: UseEntregasArgs) {
  const [entregas, setEntregas] = useState<MFEntrega[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("mf_entregas").select("*").order("created_at", { ascending: false });

    if (scope === "lojista" && userId) {
      q = q.eq("lojista_id", userId);
    } else if (scope === "entregador-disponivel" && cidade) {
      q = q.eq("status", "disponivel").eq("cidade", cidade);
    } else if (scope === "entregador-ativa" && entregadorId) {
      q = q.eq("entregador_id", entregadorId).in("status", ["aceita", "coletada"]);
    } else if (scope === "entregador-historico" && entregadorId) {
      q = q.eq("entregador_id", entregadorId).in("status", ["entregue", "cancelada"]);
    } else {
      setEntregas([]);
      setLoading(false);
      return;
    }

    const { data } = await q;
    setEntregas((data as MFEntrega[]) ?? []);
    setLoading(false);
  }, [scope, userId, entregadorId, cidade]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel(`mf_entregas:${scope}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "mf_entregas" }, () => fetch())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [scope, fetch]);

  const aceitar = async (entregaId: string, entregadorIdParam: string) => {
    await supabase
      .from("mf_entregas")
      .update({ status: "aceita" as MFEntregaStatus, entregador_id: entregadorIdParam, aceita_em: new Date().toISOString() })
      .eq("id", entregaId);
    fetch();
  };

  const marcarColetada = async (entregaId: string) => {
    await supabase
      .from("mf_entregas")
      .update({ status: "coletada" as MFEntregaStatus, coletada_em: new Date().toISOString() })
      .eq("id", entregaId);
    fetch();
  };

  const marcarEntregue = async (entregaId: string) => {
    await supabase
      .from("mf_entregas")
      .update({ status: "entregue" as MFEntregaStatus, entregue_em: new Date().toISOString() })
      .eq("id", entregaId);
    fetch();
  };

  const cancelar = async (entregaId: string) => {
    await supabase
      .from("mf_entregas")
      .update({ status: "cancelada" as MFEntregaStatus })
      .eq("id", entregaId);
    fetch();
  };

  return { entregas, loading, refetch: fetch, aceitar, marcarColetada, marcarEntregue, cancelar };
}
