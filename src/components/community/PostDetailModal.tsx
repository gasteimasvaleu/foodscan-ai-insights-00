import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { PostCard } from "./PostCard";

interface Props {
  postId: string | null;
  userId: string;
  onClose: () => void;
  onChanged?: () => void;
}

interface PostFull {
  id: string;
  description: string;
  before_photo_url: string | null;
  after_photo_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles: { name: string; avatar_url: string | null } | null;
}

export function PostDetailModal({ postId, userId, onClose, onChanged }: Props) {
  const [post, setPost] = useState<PostFull | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!postId) {
      setPost(null);
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: like }] = await Promise.all([
        supabase
          .from("community_posts")
          .select("*, profiles:user_id(name, avatar_url)")
          .eq("id", postId)
          .maybeSingle(),
        supabase
          .from("post_likes")
          .select("post_id")
          .eq("post_id", postId)
          .eq("user_id", userId)
          .maybeSingle(),
      ]);
      if (!active) return;
      setPost((p as unknown as PostFull) || null);
      setLiked(!!like);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [postId, userId]);

  return (
    <Dialog
      open={!!postId}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md max-h-[88vh] overflow-y-auto rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-xl p-0">
        {loading || !post ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : (
          <PostCard
            post={post}
            userId={userId}
            userLiked={liked}
            onLikeToggle={() => onChanged?.()}
            onPostDeleted={() => {
              onChanged?.();
              onClose();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
