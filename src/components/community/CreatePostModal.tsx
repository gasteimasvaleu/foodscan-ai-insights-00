import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImagePlus, Video as VideoIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import {
  extractFirstFrame,
  getVideoMetadata,
  validateVideo,
  videoExtensionFromMime,
} from "@/lib/videoUtils";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onCreated: () => void;
}

type Mode = "image" | "video";

const MAX_VIDEO_SECONDS = 60;
const MAX_VIDEO_MB = 50;

export function CreatePostModal({ open, onOpenChange, userId, onCreated }: Props) {
  const [mode, setMode] = useState<Mode>("image");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setDuration(null);
    setDescription("");
    setSubmitting(false);
  };

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setDuration(null);
    setMode(m);
  };

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (mode === "image") {
      if (f.size > 8 * 1024 * 1024) {
        toast({ title: "Imagem muito grande", description: "Máximo 8MB", variant: "destructive" });
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
    } else {
      try {
        const meta = await getVideoMetadata(f);
        validateVideo(f, { maxSeconds: MAX_VIDEO_SECONDS, maxMB: MAX_VIDEO_MB }, meta);
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setDuration(meta.duration);
      } catch (err: any) {
        toast({ title: "Vídeo inválido", description: err.message, variant: "destructive" });
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async () => {
    if (!file) {
      toast({ title: "Escolha uma mídia", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "image") {
        const base64 = await compressImage(file, 1200, 0.85);
        const blob = await (await fetch(`data:image/jpeg;base64,${base64}`)).blob();
        const path = `${userId}/${Date.now()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("community-images")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("community-images").getPublicUrl(path);
        const { error } = await supabase.from("community_posts").insert({
          user_id: userId,
          description: description.trim() || " ",
          before_photo_url: urlData.publicUrl,
          media_type: "image",
        });
        if (error) throw error;
      } else {
        // poster (1st frame)
        const posterBlob = await extractFirstFrame(file);
        const posterPath = `${userId}/${Date.now()}-poster.jpg`;
        const { error: posterErr } = await supabase.storage
          .from("community-images")
          .upload(posterPath, posterBlob, { contentType: "image/jpeg" });
        if (posterErr) throw posterErr;
        const { data: posterUrl } = supabase.storage
          .from("community-images")
          .getPublicUrl(posterPath);

        // video
        const ext = videoExtensionFromMime(file.type);
        const videoPath = `${userId}/${Date.now()}.${ext}`;
        const { error: vidErr } = await supabase.storage
          .from("community-videos")
          .upload(videoPath, file, { contentType: file.type });
        if (vidErr) throw vidErr;
        const { data: videoUrl } = supabase.storage
          .from("community-videos")
          .getPublicUrl(videoPath);

        const { error } = await supabase.from("community_posts").insert({
          user_id: userId,
          description: description.trim() || " ",
          before_photo_url: posterUrl.publicUrl,
          media_type: "video",
          video_url: videoUrl.publicUrl,
          video_storage_path: videoPath,
          video_poster_url: posterUrl.publicUrl,
          video_duration_seconds: duration ?? null,
        });
        if (error) throw error;
      }
      toast({ title: "Publicado! 🎉" });
      reset();
      onOpenChange(false);
      onCreated();
    } catch (e: any) {
      toast({ title: "Erro ao publicar", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const accept = mode === "image" ? "image/*" : "video/mp4,video/quicktime,video/webm";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white/70 backdrop-blur-md border-2 border-primary max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova publicação</DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="flex gap-2 p-1 rounded-xl bg-white/50 border border-primary/20">
          <button
            type="button"
            onClick={() => switchMode("image")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1.5 transition",
              mode === "image" ? "bg-[#FD46A1] text-white" : "text-foreground"
            )}
          >
            <ImagePlus size={16} /> Foto
          </button>
          <button
            type="button"
            onClick={() => switchMode("video")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1.5 transition",
              mode === "video" ? "bg-[#FD46A1] text-white" : "text-foreground"
            )}
          >
            <VideoIcon size={16} /> Vídeo
          </button>
        </div>

        <div className="space-y-3">
          {preview ? (
            mode === "image" ? (
              <img src={preview} alt="" className="w-full max-h-[50vh] object-cover rounded-2xl bg-black" />
            ) : (
              <video
                src={preview}
                controls
                muted
                playsInline
                className="w-full max-h-[50vh] object-contain rounded-2xl bg-black"
              />
            )
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className={cn(
                "w-full rounded-2xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-2 text-muted-foreground",
                mode === "image" ? "aspect-square max-h-[50vh]" : "aspect-[4/5] max-h-[50vh]"
              )}
            >
              {mode === "image" ? (
                <ImagePlus size={32} className="text-primary" />
              ) : (
                <VideoIcon size={32} className="text-primary" />
              )}
              <span className="text-base">
                {mode === "image" ? "Escolher foto" : "Escolher vídeo"}
              </span>
              {mode === "video" && (
                <span className="text-xs">Até {MAX_VIDEO_SECONDS}s · {MAX_VIDEO_MB} MB</span>
              )}
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={onSelect}
          />
          <Textarea
            placeholder="Escreva uma legenda..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] resize-none text-base"
          />
          <div className="flex gap-2 justify-end">
            {preview && (
              <Button
                variant="outline"
                onClick={() => {
                  if (preview) URL.revokeObjectURL(preview);
                  setFile(null);
                  setPreview(null);
                  setDuration(null);
                }}
                className="rounded-xl"
              >
                Trocar
              </Button>
            )}
            <Button
              disabled={!file || submitting}
              onClick={submit}
              className="rounded-xl bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Publicar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
