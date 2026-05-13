import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCelebration } from "@/contexts/CelebrationContext";

const MILESTONES = [3, 7, 14, 30, 60, 100];

export function useStreakMilestones(userId: string | undefined) {
  const { triggerCelebration } = useCelebration();
  const lastStreakRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Carrega valor inicial para não disparar celebração em valores antigos
    supabase
      .from("user_streaks")
      .select("current_streak")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        lastStreakRef.current = data?.current_streak ?? 0;
      });

    const handleUpdate = (newStreak: number) => {
      const prev = lastStreakRef.current ?? 0;
      if (newStreak > prev && MILESTONES.includes(newStreak)) {
        triggerCelebration({
          type: "streak",
          icon: "🔥",
          title: `Sequência de ${newStreak} dias!`,
          description: "Continue assim, você está pegando fogo!",
        });
      }
      lastStreakRef.current = newStreak;
    };

    const channel = supabase
      .channel(`user_streaks_${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "user_streaks", filter: `user_id=eq.${userId}` },
        (payload: any) => {
          const newStreak = payload?.new?.current_streak;
          if (typeof newStreak === "number") handleUpdate(newStreak);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_streaks", filter: `user_id=eq.${userId}` },
        (payload: any) => {
          const newStreak = payload?.new?.current_streak;
          if (typeof newStreak === "number") handleUpdate(newStreak);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, triggerCelebration]);
}
