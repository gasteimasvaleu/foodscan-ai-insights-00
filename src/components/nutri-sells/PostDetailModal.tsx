import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, Trash2, Image as ImageIcon } from "lucide-react";
import { GeneratedPost } from "@/hooks/useGeneratedPosts";
import { copyToClipboard, downloadImage } from "@/lib/socialShare";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  post: GeneratedPost | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
}

export const PostDetailModal = ({ post, onOpenChange, onDelete }: Props) => {
  if (!post) return null;
  const isVertical = post.post_type === "story" || post.post_type === "reel";

  const handleCopy = async () => {
    const text = [post.caption, post.cta, (post.hashtags || []).join(" ")]
      .filter(Boolean)
      .join("\n\n");
    const ok = await copyToClipboard(text);
    toast({
      title: ok ? "Legenda copiada" : "Falha ao copiar",
      variant: ok ? "default" : "destructive",
    });
  };

  return (
    <Dialog open={!!post} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border border-[#FD46A1]/30 shadow-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-normal pr-6 line-clamp-2">
            {post.theme}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {format(new Date(post.created_at), "d 'de' MMMM • HH:mm", { locale: ptBR })} • {post.post_type}
          </p>
        </DialogHeader>

        <div
          className={`relative ${isVertical ? "aspect-[9/16] max-w-[260px] mx-auto" : "aspect-square"} w-full rounded-xl overflow-hidden bg-[#FFD1E7]/30 border border-[#FD46A1]/15 flex items-center justify-center`}
        >
          {post.image_url ? (
            <img src={post.image_url} alt={post.theme} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="w-10 h-10" />
              <span className="text-sm">Sem imagem</span>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-3 space-y-2">
          {post.caption && (
            <p className="whitespace-pre-wrap text-sm text-foreground">{post.caption}</p>
          )}
          {post.cta && (
            <p className="text-sm font-medium text-[#FD46A1]">{post.cta}</p>
          )}
          {!!post.hashtags?.length && (
            <p className="text-xs text-muted-foreground break-words">
              {post.hashtags.join(" ")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="rounded-2xl bg-white border-[#FD46A1]/20"
            onClick={handleCopy}
            disabled={!post.caption}
          >
            <Copy className="w-4 h-4 mr-1" /> Copiar legenda
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl bg-white border-[#FD46A1]/20"
            onClick={() => post.image_url && downloadImage(post.image_url, `post-${post.id}.png`)}
            disabled={!post.image_url}
          >
            <Download className="w-4 h-4 mr-1" /> Baixar imagem
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(post.id)}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Excluir post
        </Button>
      </DialogContent>
    </Dialog>
  );
};
