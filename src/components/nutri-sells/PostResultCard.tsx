import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Share2, RefreshCw, Save, ImageIcon, Loader2, ChefHat, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard, downloadImage, shareNative } from "@/lib/socialShare";
import { supabase } from "@/integrations/supabase/client";

export interface PostResult {
  caption: string;
  hashtags: string[];
  cta: string;
  image_url: string | null;
}

interface RecipeData {
  title: string;
  servings?: string;
  prep_time?: string;
  ingredients: string[];
  steps: string[];
  tips?: string;
  macros?: { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
}

interface Props {
  result: PostResult;
  postType?: string;
  loadingImage?: boolean;
  loadingCaption?: boolean;
  saving?: boolean;
  saved?: boolean;
  theme?: string;
  audience?: string;
  onRegenerateCaption: () => void;
  onRegenerateImage: () => void;
  onSave: () => void;
  onAppendToCaption?: (extra: string) => void;
}

function formatRecipe(r: RecipeData): string {
  const lines: string[] = [];
  lines.push(`🍽️ ${r.title}`);
  if (r.servings || r.prep_time) {
    lines.push([r.servings && `Rende: ${r.servings}`, r.prep_time && `Preparo: ${r.prep_time}`].filter(Boolean).join(" • "));
  }
  lines.push("");
  lines.push("Ingredientes:");
  r.ingredients.forEach((i) => lines.push(`• ${i}`));
  lines.push("");
  lines.push("Modo de preparo:");
  r.steps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  if (r.tips) {
    lines.push("");
    lines.push(`💡 Dica: ${r.tips}`);
  }
  if (r.macros) {
    lines.push("");
    lines.push(`📊 Por porção: ${Math.round(r.macros.kcal)} kcal • P ${Math.round(r.macros.protein_g)}g • C ${Math.round(r.macros.carbs_g)}g • G ${Math.round(r.macros.fat_g)}g`);
  }
  return lines.join("\n");
}

export const PostResultCard = ({
  result, postType, loadingImage, loadingCaption, saving, saved, theme, audience,
  onRegenerateCaption, onRegenerateImage, onSave, onAppendToCaption,
}: Props) => {
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  const isVertical = postType === "story" || postType === "reel";
  const isRecipe = postType === "receita";

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

  const handleGenerateRecipe = async () => {
    setLoadingRecipe(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-post-recipe", {
        body: { theme, audience },
      });
      if (error) throw error;
      if (data?.recipe) {
        setRecipe(data.recipe as RecipeData);
      } else {
        throw new Error("no_recipe");
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao gerar receita", description: "Tente novamente em instantes.", variant: "destructive" });
    } finally {
      setLoadingRecipe(false);
    }
  };

  const handleCopyRecipe = async () => {
    if (!recipe) return;
    const ok = await copyToClipboard(formatRecipe(recipe));
    toast({ title: ok ? "Receita copiada" : "Falha ao copiar", variant: ok ? "default" : "destructive" });
  };

  const handleAppendRecipe = () => {
    if (!recipe || !onAppendToCaption) return;
    onAppendToCaption("\n\n" + formatRecipe(recipe));
    toast({ title: "Receita adicionada à legenda" });
  };

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0] pl-5 pr-4 py-4 space-y-4">
      <h2 className="text-base text-foreground">Seu post</h2>

      {/* Imagem */}
      <div className={`relative ${isVertical ? "aspect-[9/16] max-w-[280px] mx-auto" : "aspect-square"} w-full rounded-xl overflow-hidden bg-[#FFD1E7]/30 border border-[#FD46A1]/15 flex items-center justify-center`}>
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
        <Button variant="outline" className="rounded-2xl bg-white border-[#FD46A1]/20" onClick={handleDownload} disabled={!result.image_url || loadingImage}>
          <Download className="w-4 h-4 mr-1" /> Baixar
        </Button>
        <Button variant="outline" className="rounded-2xl bg-white border-[#FD46A1]/20" onClick={onRegenerateImage} disabled={loadingImage}>
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
        <Button variant="outline" className="rounded-2xl bg-white border-[#FD46A1]/20" onClick={handleCopy} disabled={loadingCaption || !result.caption}>
          <Copy className="w-4 h-4 mr-1" /> Copiar
        </Button>
        <Button variant="outline" className="rounded-2xl bg-white border-[#FD46A1]/20" onClick={onRegenerateCaption} disabled={loadingCaption}>
          <RefreshCw className="w-4 h-4 mr-1" /> Nova legenda
        </Button>
      </div>

      {/* Receita IA */}
      {isRecipe && (
        <div className="rounded-2xl bg-white/80 backdrop-blur-md p-3 space-y-3">
          {!recipe ? (
            <Button
              className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-2xl h-11"
              onClick={handleGenerateRecipe}
              disabled={loadingRecipe || !theme?.trim()}
            >
              {loadingRecipe ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando receita…</> : <><ChefHat className="w-4 h-4 mr-2" /> Gerar receita completa com IA</>}
            </Button>
          ) : (
            <>
              <div className="space-y-1">
                <h3 className="text-base font-medium text-foreground">{recipe.title}</h3>
                {(recipe.servings || recipe.prep_time) && (
                  <p className="text-xs text-muted-foreground">
                    {[recipe.servings && `Rende: ${recipe.servings}`, recipe.prep_time && `Preparo: ${recipe.prep_time}`].filter(Boolean).join(" • ")}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Ingredientes</p>
                <ul className="text-sm text-foreground space-y-0.5 list-disc list-inside">
                  {recipe.ingredients.map((i, idx) => <li key={idx}>{i}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Modo de preparo</p>
                <ol className="text-sm text-foreground space-y-1 list-decimal list-inside">
                  {recipe.steps.map((s, idx) => <li key={idx}>{s}</li>)}
                </ol>
              </div>
              {recipe.tips && <p className="text-sm text-muted-foreground">💡 {recipe.tips}</p>}
              {recipe.macros && (
                <p className="text-xs text-muted-foreground">
                  📊 Por porção: {Math.round(recipe.macros.kcal)} kcal • P {Math.round(recipe.macros.protein_g)}g • C {Math.round(recipe.macros.carbs_g)}g • G {Math.round(recipe.macros.fat_g)}g
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" className="rounded-2xl bg-white border-[#FD46A1]/20" onClick={handleCopyRecipe}>
                  <Copy className="w-4 h-4 mr-1" /> Copiar receita
                </Button>
                <Button variant="outline" className="rounded-2xl bg-white border-[#FD46A1]/20" onClick={handleAppendRecipe} disabled={!onAppendToCaption}>
                  <Plus className="w-4 h-4 mr-1" /> Add à legenda
                </Button>
              </div>
              <Button variant="ghost" className="w-full text-xs text-[#FD46A1]" onClick={handleGenerateRecipe} disabled={loadingRecipe}>
                {loadingRecipe ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RefreshCw className="w-3 h-3 mr-1" /> Gerar outra receita</>}
              </Button>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-2xl" onClick={handleShare} disabled={loadingCaption || loadingImage}>
          <Share2 className="w-4 h-4 mr-1" /> Compartilhar
        </Button>
        <Button variant="outline" className="rounded-2xl bg-white border-[#FD46A1]/20" onClick={onSave} disabled={saving || saved || loadingCaption || loadingImage}>
          <Save className="w-4 h-4 mr-1" /> {saved ? "Salvo" : saving ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </div>
  );
};
