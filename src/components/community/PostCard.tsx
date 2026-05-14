import { useState } from "react";
import { Heart, MessageCircle, Send, Trash2, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommentSection } from "./CommentSection";
import { FeedVideo } from "./FeedVideo";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    media_type?: "image" | "video" | null;
    video_url?: string | null;
    video_poster_url?: string | null;
    profiles: { name: string; avatar_url: string | null } | null;
  };
  userId: string;
  userLiked: boolean;
  onLikeToggle: () => void;
  onPostDeleted?: () => void;
}

export function PostCard({ post, userId, userLiked, onLikeToggle, onPostDeleted }: PostCardProps) {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [liked, setLiked] = useState(userLiked);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwner = post.user_id === userId;

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

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("community_posts").delete().eq("id", post.id);
    setDeleting(false);
    if (error) {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Post deletado" });
      onPostDeleted?.();
    }
  };

  const handleSendDM = async () => {
    if (isOwner) return;
    try {
      const { data: convId, error } = await supabase.rpc("get_or_create_dm_conversation", {
        _other_user: post.user_id,
      });
      if (error) throw error;
      navigate(`/comunidade/dm/${convId}`);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const authorName = post.profiles?.name || "Usuário";
  const avatarUrl = post.profiles?.avatar_url;
  const hasDescription = post.description && post.description.trim() && post.description.trim() !== ".";

  return (
    <div className="bg-card rounded-2xl border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            authorName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground text-sm truncate">{authorName}</p>
          <p className="text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 text-muted-foreground" aria-label="Mais opções">
              <MoreHorizontal size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            {!isOwner && (
              <DropdownMenuItem onClick={handleSendDM}>
                <Send size={14} className="mr-2" /> Enviar mensagem
              </DropdownMenuItem>
            )}
            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                    <Trash2 size={14} className="mr-2" /> Apagar publicação
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deletar publicação?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-primary hover:bg-primary/90 text-white rounded-xl"
                      disabled={deleting}
                    >
                      Deletar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Media (image or autoplay video, Reels-style) */}
      {post.media_type === "video" && post.video_url ? (
        <FeedVideo
          src={post.video_url}
          poster={post.video_poster_url || post.before_photo_url}
          alt={hasDescription ? post.description : "Publicação em vídeo"}
          onDoubleClick={() => !liked && handleLike()}
        />
      ) : (
        post.before_photo_url && (
          <button
            onDoubleClick={() => !liked && handleLike()}
            className="block w-full bg-black"
          >
            <img
              src={post.before_photo_url}
              alt={hasDescription ? post.description : "Publicação"}
              className="w-full max-h-[420px] object-cover"
            />
          </button>
        )
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 px-2 pt-2.5">
        <button onClick={handleLike} aria-label="Curtir" className="p-1.5">
          <Heart
            size={26}
            className={cn(
              "transition-colors",
              liked ? "fill-destructive text-destructive" : "text-foreground"
            )}
          />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowComments((v) => !v);
          }}
          aria-label="Comentar"
          className="p-1.5"
        >
          <MessageCircle size={26} className="text-foreground" />
        </button>
        {!isOwner && (
          <button onClick={handleSendDM} aria-label="Enviar mensagem" className="p-1.5">
            <Send size={24} className="text-foreground" />
          </button>
        )}
      </div>

      {/* Likes count */}
      <p className="px-3 pt-1.5 text-sm font-semibold text-foreground">
        {likesCount} {likesCount === 1 ? "curtida" : "curtidas"}
      </p>

      {/* Caption */}
      {hasDescription && (
        <p className="px-3 pt-1 text-sm text-foreground whitespace-pre-wrap">
          <span className="font-semibold mr-1.5">{authorName}</span>
          {post.description}
        </p>
      )}

      {/* Comments toggle */}
      {post.comments_count > 0 && !showComments && (
        <button
          onClick={() => setShowComments(true)}
          className="px-3 pt-1 text-sm text-muted-foreground"
        >
          Ver todos os {post.comments_count} comentários
        </button>
      )}

      {showComments && (
        <div className="px-3 pt-2 pb-3">
          <CommentSection postId={post.id} userId={userId} />
        </div>
      )}

      {!showComments && <div className="pb-3" />}
    </div>
  );
}
