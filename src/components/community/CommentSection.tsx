import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: { name: string; avatar_url: string | null } | null;
}

interface CommentSectionProps {
  postId: string;
  userId: string;
}

export function CommentSection({ postId, userId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 300);
  };

  const fetchComments = async () => {
    setLoadError(null);
    const { data, error } = await supabase
      .from("post_comments")
      .select("*, profiles:user_id(name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("fetchComments error:", error);
      setLoadError(error.message);
    }
    setComments((data as unknown as Comment[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, [postId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: userId,
        comment: newComment.trim(),
      });
      if (error) throw error;
      setNewComment("");
      fetchComments();
    } catch (err: any) {
      toast({ title: "Erro ao comentar", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-2 text-center text-muted-foreground text-sm">Carregando comentários...</div>;

  return (
    <div className="space-y-3 pt-2">
      {loadError && (
        <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          Não foi possível carregar os comentários: {loadError}
        </div>
      )}
      {!loadError && comments.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-1">Seja o primeiro a comentar.</p>
      )}
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 overflow-hidden">
            {c.profiles?.avatar_url ? (
              <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              c.profiles?.name?.charAt(0).toUpperCase() || "?"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-semibold text-foreground">{c.profiles?.name || "Usuário"}</span>{" "}
              <span className="text-muted-foreground">{c.comment}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Escreva um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="text-base h-10"
        />
        <Button size="sm" onClick={handleSubmit} disabled={submitting || !newComment.trim()} className="h-9 px-3">
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </Button>
      </div>
    </div>
  );
}
