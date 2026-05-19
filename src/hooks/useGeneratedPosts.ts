import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GeneratedPost {
  id: string;
  user_id: string;
  post_type: string;
  theme: string;
  tone: string | null;
  audience: string | null;
  caption: string | null;
  hashtags: string[] | null;
  image_url: string | null;
  cta: string | null;
  created_at: string;
}

export function useGeneratedPosts() {
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("generated_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) setPosts(data as GeneratedPost[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(async (id: string) => {
    await supabase.from("generated_posts").delete().eq("id", id);
    setPosts((p) => p.filter((x) => x.id !== id));
  }, []);

  const save = useCallback(
    async (post: Omit<GeneratedPost, "id" | "user_id" | "created_at">) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await supabase
        .from("generated_posts")
        .insert({ ...post, user_id: u.user.id })
        .select()
        .single();
      if (error) {
        console.error(error);
        return null;
      }
      setPosts((p) => [data as GeneratedPost, ...p]);
      return data as GeneratedPost;
    },
    []
  );

  return { posts, loading, reload: load, remove, save };
}
