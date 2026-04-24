import { useState } from "react";
import { Shirt, Sparkles, Download, RotateCcw, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { compressImage } from "@/lib/imageCompression";
import VideoOverlay from "@/components/VideoOverlay";
import TryOnUpload from "@/components/provador/TryOnUpload";
import LookHistoryGrid from "@/components/provador/LookHistoryGrid";
import { useProvadorHistory } from "@/hooks/useProvadorHistory";

type SlotKey = "user" | "outfit";

interface SlotState {
  file: File | null;
  previewUrl: string | null;
  publicUrl: string | null;
  uploading: boolean;
}

const emptySlot: SlotState = {
  file: null,
  previewUrl: null,
  publicUrl: null,
  uploading: false,
};

export default function Provador() {
  const { user, loading: authLoading } = useAuth();
  const [userSlot, setUserSlot] = useState<SlotState>(emptySlot);
  const [outfitSlot, setOutfitSlot] = useState<SlotState>(emptySlot);
  const [generating, setGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const {
    history,
    usedToday,
    dailyLimit,
    remaining,
    isAdmin,
    loading: historyLoading,
    refresh: refreshHistory,
    deleteItem,
  } = useProvadorHistory();

  const setSlot = (key: SlotKey, value: SlotState | ((prev: SlotState) => SlotState)) => {
    if (key === "user") setUserSlot(value as any);
    else setOutfitSlot(value as any);
  };

  const handleFileSelected = async (key: SlotKey, file: File) => {
    if (!user) {
      toast.error("Faça login para continuar.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSlot(key, { file, previewUrl, publicUrl: null, uploading: true });

    try {
      const compressedB64 = await compressImage(file, 1200, 0.85);
      const bytes = Uint8Array.from(atob(compressedB64), (c) => c.charCodeAt(0));
      const path = `${user.id}/${Date.now()}-${key}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("provador")
        .upload(path, bytes, { contentType: "image/jpeg", upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("provador").getPublicUrl(path);
      setSlot(key, (prev) => ({ ...prev, publicUrl: pub.publicUrl, uploading: false }));
    } catch (e) {
      console.error("upload error", e);
      toast.error("Falha ao enviar a imagem. Tente novamente.");
      setSlot(key, emptySlot);
    }
  };

  const handleClear = (key: SlotKey) => {
    if (key === "user") setUserSlot(emptySlot);
    else setOutfitSlot(emptySlot);
  };

  const limitReached = !isAdmin && remaining <= 0;
  const canGenerate =
    !!userSlot.publicUrl &&
    !!outfitSlot.publicUrl &&
    !userSlot.uploading &&
    !outfitSlot.uploading &&
    !limitReached;

  const handleGenerate = async () => {
    if (!canGenerate || !user) return;
    setGenerating(true);
    setResultUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke("virtual-tryon", {
        body: {
          userImageUrl: userSlot.publicUrl,
          outfitImageUrl: outfitSlot.publicUrl,
        },
      });

      if (error) {
        const status = (error as any).context?.status;
        const ctxBody = (error as any).context?.body;
        const limit = ctxBody?.limitReached || data?.limitReached;
        if (status === 429 && limit) {
          toast.error(`Limite diário atingido (${dailyLimit} gerações por dia).`);
          await refreshHistory();
        } else if (status === 429) {
          toast.error("Muitas solicitações. Aguarde um instante e tente novamente.");
        } else if (status === 402) {
          toast.error("Créditos de IA esgotados. Adicione créditos para continuar.");
        } else {
          toast.error((error as any).message || "Falha ao gerar a imagem.");
        }
        return;
      }

      if (!data?.imageUrl) {
        toast.error("A IA não retornou uma imagem. Tente outras fotos.");
        return;
      }

      setResultUrl(data.imageUrl);
      toast.success("Look gerado com sucesso!");
      await refreshHistory();
    } catch (e) {
      console.error("generate error", e);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setUserSlot(emptySlot);
    setOutfitSlot(emptySlot);
    setResultUrl(null);
  };

  const handleChangeOutfit = () => {
    setOutfitSlot(emptySlot);
    setResultUrl(null);
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    try {
      const resp = await fetch(resultUrl);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wediet-provador-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Não foi possível baixar a imagem.");
    }
  };

  const handleShareWhatsApp = () => {
    if (!resultUrl) return;
    const text = `Olha o look que provei no We Diet! ${resultUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-[calc(env(safe-area-inset-top)+4rem)] px-4 text-center text-muted-foreground">
          Carregando...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-[calc(env(safe-area-inset-top)+4rem)] px-4">
          <AuthCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <VideoOverlay
        isVisible={generating}
        message="Gerando seu look…"
        subMessage="A IA está vestindo você com o novo look"
      />

      <div className="container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)]">
        {/* Header */}
        <div className="mb-5 animate-fade-in">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <Shirt className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-primary leading-tight">Provador Virtual</h1>
            </div>
          </div>
        </div>

        {!resultUrl && (
          <>
            <p className="text-sm text-muted-foreground mb-4 px-1">
              Envie sua foto e a foto de uma roupa. A IA cria você usando o look em fundo de estúdio.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <TryOnUpload
                label="Sua foto"
                hint="Rosto e corpo aparentes, boa iluminação"
                previewUrl={userSlot.previewUrl}
                onFileSelected={(f) => handleFileSelected("user", f)}
                onClear={() => handleClear("user")}
                disabled={generating || userSlot.uploading}
              />
              <TryOnUpload
                label="A roupa"
                hint="Foto da peça ou look completo"
                previewUrl={outfitSlot.previewUrl}
                onFileSelected={(f) => handleFileSelected("outfit", f)}
                onClear={() => handleClear("outfit")}
                disabled={generating || outfitSlot.uploading}
              />
            </div>

            {!isAdmin && (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Hoje: {Math.min(usedToday, dailyLimit)} de {dailyLimit} gerações
              </p>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || generating}
              className="w-full mt-2 h-12 rounded-2xl bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white text-base font-semibold shadow-lg disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {limitReached
                ? "Limite diário atingido"
                : userSlot.uploading || outfitSlot.uploading
                ? "Enviando fotos…"
                : "Provar look"}
            </Button>

            <p className="text-[11px] text-muted-foreground mt-3 px-2 text-center leading-snug">
              Imagem gerada por IA, apenas para entretenimento. Não envie fotos de terceiros sem
              consentimento.
            </p>
          </>
        )}

        {resultUrl && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-3xl overflow-hidden bg-[#FFD1E7]/40 border border-primary/10 shadow-xl max-w-sm mx-auto">
              <div className="aspect-square w-full bg-white">
                <img
                  src={resultUrl}
                  alt="Resultado do provador"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="h-12 rounded-2xl border-primary/30 text-primary"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar
              </Button>
              <Button
                onClick={handleShareWhatsApp}
                className="h-12 rounded-2xl bg-[#25D366] hover:bg-[#25D366]/90 text-white"
              >
                Compartilhar
              </Button>
              <Button
                onClick={handleChangeOutfit}
                variant="outline"
                className="h-12 rounded-2xl border-primary/30 text-primary"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Trocar roupa
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-12 rounded-2xl border-primary/30 text-primary"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Refazer
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground px-2 text-center leading-snug">
              Imagem gerada por IA, apenas para entretenimento.
            </p>
          </div>
        )}

        {/* Histórico de looks */}
        <div className="mt-8">
          <h2 className="text-base text-foreground mb-3 px-1">Meus looks</h2>
          <LookHistoryGrid
            history={history}
            loading={historyLoading}
            onDelete={deleteItem}
          />
        </div>
      </div>
    </div>
  );
}
