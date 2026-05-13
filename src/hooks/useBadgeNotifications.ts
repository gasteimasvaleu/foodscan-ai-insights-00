import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useBadgeNotifications(userId: string | undefined) {
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
            toast.success(`${data.icon} Conquista desbloqueada!`, {
              description: `${data.name} — ${data.description}`,
              duration: 6000,
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
