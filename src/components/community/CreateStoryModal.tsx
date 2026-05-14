import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onCreated: () => void;
}

export function CreateStoryModal({ open, onOpenChange, userId, onCreated }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setSubmitting(false);
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "Máximo 8MB", variant: "destructive" });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;
    setSubmitting(true);
    try {
      const base64 = await compressImage(file, 1080, 0.85);
      const blob = await (await fetch(`data:image/jpeg;base64,${base64}`)).blob();
      const path = `${userId}/${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("community-stories")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("community-stories").getPublicUrl(path);
      const { error } = await supabase.from("community_stories").insert({
        user_id: userId,
        image_url: urlData.publicUrl,
        storage_path: path,
      });
      if (error) throw error;
      toast({ title: "Story publicado!" });
      reset();
      onOpenChange(false);
      onCreated();
    } catch (e: any) {
      toast({ title: "Erro ao publicar", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white/70 backdrop-blur-md border-2 border-primary">
        <DialogHeader>
          <DialogTitle>Novo story</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {preview ? (
            <img src={preview} alt="" className="w-full max-h-[60vh] object-contain rounded-2xl bg-black" />
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full aspect-[9/16] max-h-[50vh] rounded-2xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-2 text-muted-foreground"
            >
              <ImagePlus size={32} className="text-primary" />
              <span className="text-base">Escolher foto</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onSelect}
          />
          <div className="flex gap-2 justify-end">
            {preview && (
              <Button variant="outline" onClick={reset} className="rounded-xl">
                Trocar
              </Button>
            )}
            <Button
              disabled={!file || submitting}
              onClick={submit}
              className="rounded-xl bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Publicar story"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
