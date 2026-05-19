import { Button } from "@/components/ui/button";
import { Copy, Download, Share2, RefreshCw, Save, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard, downloadImage, shareNative } from "@/lib/socialShare";

export interface PostResult {
  caption: string;
  hashtags: string[];
  cta: string;
  image_url: string | null;
}

interface Props {
  result: PostResult;
  loadingImage?: boolean;
  loadingCaption?: boolean;
  saving?: boolean;
  saved?: boolean;
  onRegenerateCaption: () => void;
  onRegenerateImage: () => void;
  onSave: () => void;
}

export const PostResultCard = ({
  result, loadingImage, loadingCaption, saving, saved,
  onRegenerateCaption, onRegenerateImage, onSave,
}: Props) => {
  const fullCaption = [result.caption, result.cta, (result.hashtags || []).join(" ")]
    .filter(Boolean)
    .join("\n\n");

  const handleCopy = async () => {
    const ok = await copyToClipboard(fullCaption);
    toast({ title: ok ? "Legenda copiada" : "Falha ao copiar", description: ok ? "Cole no Instagram quando for postar." : undefined, variant: ok ? "default" : "destructive" });
  };

  const handleDownload = async () => {
    if (!result.image_url) return;
    await downloadImage(result.image_url, `post-${Date.now()}.png`);
  };

  const handleShare = async () => {
    const ok = await shareNative(fullCaption, result.image_url || undefined);
    if (!ok) handleCopy();
  };

  return (
    <div className="rounded-3xl bg-[#FFD1E7] p-4 space-y-4">
      <h2 className="text-base text-foreground">Seu post</h2>

      {/* Imagem */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white/70 backdrop-blur-md flex items-center justify-center">
        {loadingImage ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-[#FD46A1]" />
            <span className="text-sm">Gerando imagem…</span>
          </div>
        ) : result.image_url ? (
          <img src={result.image_url} alt="Post gerado" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-10 h-10" />
            <span className="text-sm">Sem imagem</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="rounded-2xl bg-white border-[#FD46A1]/20"
          onClick={handleDownload}
          disabled={!result.image_url || loadingImage}
        >
          <Download className="w-4 h-4 mr-1" /> Baixar
        </Button>
        <Button
          variant="outline"
          className="rounded-2xl bg-white border-[#FD46A1]/20"
          onClick={onRegenerateImage}
          disabled={loadingImage}
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Nova imagem
        </Button>
      </div>

      {/* Legenda */}
      <div className="rounded-2xl bg-white/80 backdrop-blur-md p-3 space-y-2">
        {loadingCaption ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Gerando legenda…
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-sm text-foreground">{result.caption}</p>
            {result.cta && <p className="text-sm font-medium text-[#FD46A1]">{result.cta}</p>}
            <p className="text-xs text-muted-foreground break-words">
              {(result.hashtags || []).join(" ")}
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="rounded-2xl bg-white border-[#FD46A1]/20"
          onClick={handleCopy}
          disabled={loadingCaption || !result.caption}
        >
          <Copy className="w-4 h-4 mr-1" /> Copiar
        </Button>
        <Button
          variant="outline"
          className="rounded-2xl bg-white border-[#FD46A1]/20"
          onClick={onRegenerateCaption}
          disabled={loadingCaption}
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Nova legenda
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-2xl"
          onClick={handleShare}
          disabled={loadingCaption || loadingImage}
        >
          <Share2 className="w-4 h-4 mr-1" /> Compartilhar
        </Button>
        <Button
          variant="outline"
          className="rounded-2xl bg-white border-[#FD46A1]/20"
          onClick={onSave}
          disabled={saving || saved || loadingCaption || loadingImage}
        >
          <Save className="w-4 h-4 mr-1" /> {saved ? "Salvo" : saving ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </div>
  );
};
