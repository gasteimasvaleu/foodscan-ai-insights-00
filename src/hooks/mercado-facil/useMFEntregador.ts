import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";
import type { MFEntregador } from "@/lib/mercado-facil/entregador-types";

export function useMFEntregador() {
  const { user } = useAuthContext();
  const [entregador, setEntregador] = useState<MFEntregador | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setEntregador(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("mf_entregadores")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    setEntregador((data as MFEntregador) ?? null);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setDisponivel = async (disponivel: boolean) => {
    if (!entregador) return;
    const { data, error } = await supabase
      .from("mf_entregadores")
      .update({ disponivel })
      .eq("id", entregador.id)
      .select()
      .single();
    if (!error && data) setEntregador(data as MFEntregador);
  };

  return { entregador, loading, reload, setDisponivel };
}
