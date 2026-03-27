import { useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommentSection } from "./CommentSection";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PostCardProps {
  post: {
    id: string;
    description: string;
    before_photo_url: string | null;
    after_photo_url: string | null;
    likes_count: number;
    comments_count: number;
    created_at: string;
    user_id: string;
    profiles: { name: string; avatar_url: string | null } | null;
  };
  userId: string;
  userLiked: boolean;
  onLikeToggle: () => void;
  onPostDeleted?: () => void;
}

export function PostCard({ post, userId, userLiked, onLikeToggle, onPostDeleted }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [liked, setLiked] = useState(userLiked);
  const [toggling, setToggling] = useState(false);

  const handleLike = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      if (liked) {
        await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", userId);
        setLikesCount((c) => Math.max(0, c - 1));
      } else {
        await supabase.from("post_likes").insert({ post_id: post.id, user_id: userId });
        setLikesCount((c) => c + 1);
      }
      setLiked(!liked);
      onLikeToggle();
    } finally {
      setToggling(false);
    }
  };

  const authorName = post.profiles?.name || "Usuário";
  const avatarUrl = post.profiles?.avatar_url;

  return (
    <div className="bg-card rounded-2xl border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            authorName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{authorName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="px-4 pb-3 text-sm text-foreground whitespace-pre-wrap">{post.description}</p>

      {/* Image */}
      {post.before_photo_url && (
        <img src={post.before_photo_url} alt="Post" className="w-full max-h-96 object-cover" />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t">
        <button onClick={handleLike} className="flex items-center gap-1.5 text-sm transition-colors">
          <Heart
            size={20}
            className={cn(
              "transition-colors",
              liked ? "fill-destructive text-destructive" : "text-muted-foreground"
            )}
          />
          <span className={cn("font-medium", liked ? "text-destructive" : "text-muted-foreground")}>
            {likesCount}
          </span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle size={20} />
          <span className="font-medium">{post.comments_count}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-4 border-t">
          <CommentSection postId={post.id} userId={userId} />
        </div>
      )}
    </div>
  );
}
