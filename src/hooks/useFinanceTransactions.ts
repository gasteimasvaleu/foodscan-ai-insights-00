import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { FinanceKind } from "@/lib/financas/categories";

export interface FinanceTx {
  id: string;
  user_id: string;
  kind: FinanceKind;
  amount_cents: number;
  category: string;
  description: string | null;
  occurred_on: string;
  created_at: string;
  updated_at: string;
}

export interface NewTxInput {
  kind: FinanceKind;
  amount_cents: number;
  category: string;
  description?: string | null;
  occurred_on: string;
}

export function useFinanceTransactions(opts: { startDate?: string; endDate?: string; date?: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<FinanceTx[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let q = supabase
      .from("finance_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (opts.date) q = q.eq("occurred_on", opts.date);
    if (opts.startDate) q = q.gte("occurred_on", opts.startDate);
    if (opts.endDate) q = q.lte("occurred_on", opts.endDate);
    const { data: rows, error } = await q;
    if (!error && rows) setData(rows as FinanceTx[]);
    setLoading(false);
  }, [user, opts.date, opts.startDate, opts.endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const create = useCallback(
    async (input: NewTxInput) => {
      if (!user) throw new Error("not_authenticated");
      const { error } = await supabase.from("finance_transactions").insert({
        ...input,
        user_id: user.id,
      });
      if (error) throw error;
      await fetchData();
    },
    [user, fetchData]
  );

  const update = useCallback(
    async (id: string, input: Partial<NewTxInput>) => {
      const { error } = await supabase
        .from("finance_transactions")
        .update(input)
        .eq("id", id);
      if (error) throw error;
      await fetchData();
    },
    [fetchData]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("finance_transactions").delete().eq("id", id);
      if (error) throw error;
      await fetchData();
    },
    [fetchData]
  );

  return { data, loading, refetch: fetchData, create, update, remove };
}
