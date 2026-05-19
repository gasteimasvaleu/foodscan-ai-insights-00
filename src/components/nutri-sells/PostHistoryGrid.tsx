import { Button } from "@/components/ui/button";
import { Trash2, Copy, Download } from "lucide-react";
import { GeneratedPost } from "@/hooks/useGeneratedPosts";
import { copyToClipboard, downloadImage } from "@/lib/socialShare";
import { toast } from "@/hooks/use-toast";

interface Props {
  posts: GeneratedPost[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export const PostHistoryGrid = ({ posts, loading, onDelete }: Props) => {
  if (loading) return <p className="text-sm text-muted-foreground text-center py-6">Carregando…</p>;
  if (!posts.length) {
    return (
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0] pl-5 pr-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Você ainda não salvou nenhum post. Gere e clique em "Salvar".
        </p>
      </div>
    );
  }

  const handleCopy = async (p: GeneratedPost) => {
    const text = [p.caption, p.cta, (p.hashtags || []).join(" ")].filter(Boolean).join("\n\n");
    const ok = await copyToClipboard(text);
    toast({ title: ok ? "Legenda copiada" : "Falha ao copiar", variant: ok ? "default" : "destructive" });
  };

  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <div key={p.id} className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0] pl-5 pr-3 py-3 flex gap-3">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FFD1E7]/30 border border-[#FD46A1]/15 flex-shrink-0">
            {p.image_url ? (
              <img src={p.image_url} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm text-foreground line-clamp-1">{p.theme}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(p.created_at).toLocaleDateString("pt-BR")} • {p.post_type}
            </p>
            <div className="flex gap-1 pt-1">
              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleCopy(p)}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
              {p.image_url && (
                <Button
                  size="sm" variant="ghost" className="h-8 px-2"
                  onClick={() => downloadImage(p.image_url!, `post-${p.id}.png`)}
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                size="sm" variant="ghost" className="h-8 px-2 text-destructive ml-auto"
                onClick={() => onDelete(p.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
