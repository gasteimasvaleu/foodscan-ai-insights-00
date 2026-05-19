import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type VenueCategory = "bar" | "restaurante" | "festa" | "balada";

export interface Venue {
  id: string;
  owner_id: string;
  name: string;
  category: VenueCategory;
  city: string;
  address: string | null;
  photo_url: string | null;
  description: string | null;
  rules: string | null;
  status: "pending" | "approved" | "rejected";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  online_count?: number;
}

export const VENUE_CATEGORIES: { value: VenueCategory; label: string; emoji: string }[] = [
  { value: "bar", label: "Bar", emoji: "🍻" },
  { value: "restaurante", label: "Restaurante", emoji: "🍽️" },
  { value: "festa", label: "Festa", emoji: "🎉" },
  { value: "balada", label: "Balada", emoji: "💃" },
];

interface UseVenuesParams {
  search?: string;
  category?: VenueCategory | null;
}

export function useVenues({ search = "", category = null }: UseVenuesParams = {}) {
  return useQuery({
    queryKey: ["venues", "approved", search, category],
    queryFn: async () => {
      let q = supabase
        .from("venues")
        .select("*")
        .eq("status", "approved")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(100);

      if (category) q = q.eq("category", category);
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`name.ilike.${s},city.ilike.${s}`);
      }

      const { data, error } = await q;
      if (error) throw error;

      const venues = (data ?? []) as Venue[];
      // Carrega online count em paralelo
      const enriched = await Promise.all(
        venues.map(async (v) => {
          const { data: oc } = await supabase.rpc("get_venue_online_count", { _venue_id: v.id });
          return { ...v, online_count: (oc as number) ?? 0 };
        })
      );
      return enriched;
    },
  });
}

export function useMyVenues(userId: string | undefined) {
  return useQuery({
    queryKey: ["venues", "mine", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("owner_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Venue[];
    },
  });
}

export function useVenue(venueId: string | undefined) {
  return useQuery({
    queryKey: ["venue", venueId],
    enabled: !!venueId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("id", venueId!)
        .maybeSingle();
      if (error) throw error;
      return data as Venue | null;
    },
  });
}
