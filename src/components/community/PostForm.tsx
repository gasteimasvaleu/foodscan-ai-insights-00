import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PostFormProps {
  userId: string;
  onPostCreated: () => void;
}

export function PostForm({ userId, onPostCreated }: PostFormProps) {
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "Máximo 5MB", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({ title: "Escreva algo para publicar", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("community-images")
          .upload(path, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("community-images")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("community_posts").insert({
        user_id: userId,
        description: description.trim(),
        before_photo_url: imageUrl,
      });
      if (error) throw error;

      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      onPostCreated();
      toast({ title: "Publicado com sucesso! 🎉" });
    } catch (err: any) {
      toast({ title: "Erro ao publicar", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border p-4 space-y-3">
      <Textarea
        placeholder="Compartilhe sua jornada fitness... 💪"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-[80px] resize-none border-0 bg-muted/50 focus-visible:ring-1"
      />
      {imagePreview && (
        <div className="relative">
          <img src={imagePreview} alt="Preview" className="rounded-xl max-h-48 object-cover w-full" />
          <button
            onClick={() => { setImageFile(null); setImagePreview(null); }}
            className="absolute top-2 right-2 bg-background/80 rounded-full p-1 text-foreground"
          >✕</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <label className="cursor-pointer text-muted-foreground hover:text-primary transition-colors">
          <ImagePlus size={22} />
          <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </label>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !description.trim()}
          size="sm"
          className="rounded-full gap-2"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Publicar
        </Button>
      </div>
    </div>
  );
}
