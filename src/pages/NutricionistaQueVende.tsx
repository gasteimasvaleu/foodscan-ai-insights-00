import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PostGeneratorForm, PostFormValues } from "@/components/nutri-sells/PostGeneratorForm";
import { PostResultCard, PostResult } from "@/components/nutri-sells/PostResultCard";
import { PostHistoryGrid } from "@/components/nutri-sells/PostHistoryGrid";
import { WeeklyIdeasCard } from "@/components/nutri-sells/WeeklyIdeasCard";
import { useGeneratedPosts } from "@/hooks/useGeneratedPosts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { Megaphone } from "lucide-react";

export default function NutricionistaQueVende() {
  const [form, setForm] = useState<PostFormValues>({
    post_type: "dica", theme: "", tone: "Profissional", audience: "Saúde geral",
  });
  const [result, setResult] = useState<PostResult | null>(null);
  const [loadingCaption, setLoadingCaption] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { posts, loading: loadingPosts, remove, save, reload } = useGeneratedPosts();

  const generateCaption = async (values: PostFormValues) => {
    setLoadingCaption(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-social-caption", {
        body: { post_type: values.post_type, theme: values.theme, tone: values.tone, audience: values.audience },
      });
      if (error) throw error;
      return {
        caption: String(data?.caption || ""),
        hashtags: Array.isArray(data?.hashtags) ? data.hashtags : [],
        cta: String(data?.cta || ""),
      };
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao gerar legenda", description: "Tente novamente em instantes.", variant: "destructive" });
      return null;
    } finally {
      setLoadingCaption(false);
    }
  };

  const generateImage = async (values: PostFormValues) => {
    setLoadingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-social-image", {
        body: { theme: values.theme, post_type: values.post_type },
      });
      if (error) throw error;
      return String(data?.image_url || "");
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao gerar imagem", description: "Tente novamente em instantes.", variant: "destructive" });
      return null;
    } finally {
      setLoadingImage(false);
    }
  };

  const handleGenerate = async (values: PostFormValues) => {
    setForm(values);
    setSaved(false);
    setResult({ caption: "", hashtags: [], cta: "", image_url: null });
    const [cap, img] = await Promise.all([generateCaption(values), generateImage(values)]);
    setResult({
      caption: cap?.caption || "",
      hashtags: cap?.hashtags || [],
      cta: cap?.cta || "",
      image_url: img,
    });
  };

  const handleRegenerateCaption = async () => {
    const cap = await generateCaption(form);
    if (cap && result) setResult({ ...result, ...cap });
    setSaved(false);
  };

  const handleRegenerateImage = async () => {
    const img = await generateImage(form);
    if (img && result) setResult({ ...result, image_url: img });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    const r = await save({
      post_type: form.post_type,
      theme: form.theme,
      tone: form.tone,
      audience: form.audience,
      caption: result.caption,
      hashtags: result.hashtags,
      cta: result.cta,
      image_url: result.image_url,
    });
    setSaving(false);
    if (r) {
      setSaved(true);
      toast({ title: "Post salvo no histórico" });
    } else {
      toast({ title: "Não foi possível salvar", variant: "destructive" });
    }
  };

  const handlePickIdea = (idea: { title: string; hook: string; post_type: string }) => {
    const values: PostFormValues = {
      ...form,
      post_type: idea.post_type || form.post_type,
      theme: `${idea.title} — ${idea.hook}`,
    };
    setForm(values);
    handleGenerate(values);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F7FAFB] pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-[#FD46A1]">Nutricionista que Vende</h1>
          <p className="text-sm text-muted-foreground">
            Gere posts profissionais para o Instagram. Baixe a imagem, copie a legenda e cole direto no app do Instagram.
          </p>
        </header>

        <Tabs defaultValue="criar">
          <TabsList className="grid w-full grid-cols-3 bg-[#FFD1E7]/50 rounded-2xl">
            <TabsTrigger value="criar" className="rounded-xl">Criar</TabsTrigger>
            <TabsTrigger value="ideias" className="rounded-xl">Ideias</TabsTrigger>
            <TabsTrigger value="meus" className="rounded-xl" onClick={reload}>Meus posts</TabsTrigger>
          </TabsList>

          <TabsContent value="criar" className="space-y-4 mt-4">
            <PostGeneratorForm
              initial={form}
              loading={loadingCaption || loadingImage}
              onSubmit={handleGenerate}
            />
            {result && (
              <PostResultCard
                result={result}
                postType={form.post_type}
                theme={form.theme}
                audience={form.audience}
                loadingCaption={loadingCaption}
                loadingImage={loadingImage}
                saving={saving}
                saved={saved}
                onRegenerateCaption={handleRegenerateCaption}
                onRegenerateImage={handleRegenerateImage}
                onSave={handleSave}
                onAppendToCaption={(extra) => {
                  setResult((r) => r ? { ...r, caption: (r.caption || "") + extra } : r);
                  setSaved(false);
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="ideias" className="mt-4">
            <WeeklyIdeasCard audience={form.audience} onPick={handlePickIdea} />
          </TabsContent>

          <TabsContent value="meus" className="mt-4">
            <PostHistoryGrid posts={posts} loading={loadingPosts} onDelete={remove} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
