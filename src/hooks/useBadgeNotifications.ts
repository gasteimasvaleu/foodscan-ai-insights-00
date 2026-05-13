import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCelebration } from "@/contexts/CelebrationContext";

export function useBadgeNotifications(userId: string | undefined) {
  const { triggerCelebration } = useCelebration();

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`user_badges_${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_badges", filter: `user_id=eq.${userId}` },
        async (payload: any) => {
          const badgeId = payload?.new?.badge_id;
          if (!badgeId) return;
          const { data } = await supabase
            .from("badges")
            .select("name,icon,description")
            .eq("id", badgeId)
            .maybeSingle();
          if (data) {
            triggerCelebration({
              type: "badge",
              icon: data.icon || "🏆",
              title: data.name,
              description: data.description ?? "",
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, triggerCelebration]);
}
