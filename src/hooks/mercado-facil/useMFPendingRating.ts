import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthProvider";
import type { MFEntrega, MFEntregador } from "@/lib/mercado-facil/entregador-types";

const DISMISS_KEY = "mf_rating_dismissed_v1";

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useMFPendingRating() {
  const { user } = useAuthContext();
  const [entrega, setEntrega] = useState<MFEntrega | null>(null);
  const [entregador, setEntregador] = useState<MFEntregador | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setEntrega(null);
      setEntregador(null);
      return;
    }
    const { data: entregues } = await supabase
      .from("mf_entregas")
      .select("*")
      .eq("cliente_id", user.id)
      .eq("status", "entregue")
      .not("entregador_id", "is", null)
      .order("entregue_em", { ascending: false })
      .limit(10);

    const lista = (entregues ?? []) as MFEntrega[];
    if (lista.length === 0) {
      setEntrega(null);
      return;
    }

    const ids = lista.map((e) => e.id);
    const { data: jaAvaliadas } = await supabase
      .from("mf_entregador_avaliacoes")
      .select("entrega_id")
      .in("entrega_id", ids);
    const avaliadasSet = new Set((jaAvaliadas ?? []).map((a: any) => a.entrega_id));
    const dismissed = new Set(getDismissed());

    const pendente = lista.find((e) => !avaliadasSet.has(e.id) && !dismissed.has(e.id));
    if (!pendente) {
      setEntrega(null);
      setEntregador(null);
      return;
    }

    setEntrega(pendente);
    const { data: ent } = await supabase
      .from("mf_entregadores")
      .select("*")
      .eq("id", pendente.entregador_id!)
      .maybeSingle();
    setEntregador((ent as MFEntregador) ?? null);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`mf-rating-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "mf_entregas", filter: `cliente_id=eq.${user.id}` },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mf_entregador_avaliacoes", filter: `autor_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();

    const onVisibility = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [user?.id, load]);

  const dismiss = () => {
    if (!entrega) return;
    const cur = getDismissed();
    if (!cur.includes(entrega.id)) {
      cur.push(entrega.id);
      localStorage.setItem(DISMISS_KEY, JSON.stringify(cur.slice(-50)));
    }
    setEntrega(null);
    setEntregador(null);
  };

  const submit = async (nota: number, comentario: string) => {
    if (!entrega || !entregador || !user) return { ok: false };
    const { error } = await supabase.from("mf_entregador_avaliacoes").insert({
      entrega_id: entrega.id,
      entregador_id: entregador.id,
      autor_id: user.id,
      nota,
      comentario: comentario.trim() || null,
    });
    if (error) {
      console.warn("[mf_avaliacao] insert:", error.message);
      return { ok: false, error };
    }
    setEntrega(null);
    setEntregador(null);
    return { ok: true };
  };

  return { entrega, entregador, dismiss, submit, reload: load };
}
