import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_ID = "9051a4db-edf7-45db-97f0-72f2021ee4b6";
const DAILY_LIMIT = 3;

export interface ProvadorGeneration {
  id: string;
  user_id: string;
  result_url: string;
  user_image_url: string | null;
  outfit_image_url: string | null;
  created_at: string;
}

function startOfTodayUtcIso() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function extractStoragePath(publicUrl: string): string | null {
  // .../storage/v1/object/public/provador/<path>
  const marker = "/object/public/provador/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.substring(idx + marker.length);
}

export function useProvadorHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ProvadorGeneration[]>([]);
  const [usedToday, setUsedToday] = useState(0);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.id === ADMIN_ID;
  const remaining = isAdmin ? Infinity : Math.max(0, DAILY_LIMIT - usedToday);

  const refresh = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setUsedToday(0);
      return;
    }
    setLoading(true);
    try {
      const [allRes, todayRes] = await Promise.all([
        supabase
          .from("provador_generations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(60),
        supabase
          .from("provador_generations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfTodayUtcIso()),
      ]);

      if (!allRes.error && allRes.data) {
        setHistory(allRes.data as ProvadorGeneration[]);
      }
      if (!todayRes.error) {
        setUsedToday(todayRes.count ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const deleteItem = useCallback(
    async (id: string) => {
      const item = history.find((h) => h.id === id);
      const { error } = await supabase
        .from("provador_generations")
        .delete()
        .eq("id", id);
      if (error) throw error;

      if (item?.result_url) {
        const path = extractStoragePath(item.result_url);
        if (path) {
          await supabase.storage.from("provador").remove([path]);
        }
      }
      setHistory((prev) => prev.filter((h) => h.id !== id));
      // Note: we intentionally do NOT decrement usedToday — daily limit is
      // counted by historical generations, not live items.
    },
    [history],
  );

  return {
    history,
    usedToday,
    dailyLimit: DAILY_LIMIT,
    remaining,
    isAdmin,
    loading,
    refresh,
    deleteItem,
  };
}
