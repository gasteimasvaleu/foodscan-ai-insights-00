import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ImageOff } from "lucide-react";

interface GridPost {
  id: string;
  before_photo_url: string | null;
}

interface Props {
  userId: string;
  onOpenPost: (postId: string) => void;
  refreshKey?: number;
}

export function MyPostsGrid({ userId, onOpenPost, refreshKey }: Props) {
  const [posts, setPosts] = useState<GridPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("community_posts")
        .select("id, before_photo_url")
        .eq("user_id", userId)
        .not("before_photo_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(200);
      if (!active) return;
      setPosts((data as GridPost[]) || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [userId, refreshKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ImageOff className="mx-auto mb-2 opacity-50" size={32} />
        <p className="font-medium">Você ainda não publicou nada</p>
        <p className="text-sm">Suas publicações aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((p) => (
        <button
          key={p.id}
          onClick={() => onOpenPost(p.id)}
          className="aspect-square bg-muted overflow-hidden active:opacity-80"
          aria-label="Abrir publicação"
        >
          {p.before_photo_url && (
            <img
              src={p.before_photo_url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </button>
      ))}
    </div>
  );
}
