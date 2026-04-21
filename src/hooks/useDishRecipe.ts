import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import {
  Recipe,
  FastFoodOption,
  isRecipe,
  isMultipleOptions,
  isRecipeError,
} from "@/types/recipe";
import { toast } from "sonner";

export type AnalysisStep = "idle" | "uploading" | "identifying" | "generating";

export function useDishRecipe() {
  const [step, setStep] = useState<AnalysisStep>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [options, setOptions] = useState<FastFoodOption[] | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("idle");
    setIsLoading(false);
    setRecipe(null);
    setOptions(null);
    setImageBase64(null);
    setError(null);
  }, []);

  const analyzeImage = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setRecipe(null);
      setOptions(null);
      setStep("uploading");

      const b64 = await compressImage(file, 1200, 0.85);
      setImageBase64(b64);

      setStep("identifying");
      const { data, error: fnErr } = await supabase.functions.invoke("identify-dish", {
        body: { imageBase64: b64 },
      });

      if (fnErr) throw fnErr;

      if (isRecipeError(data)) {
        setError(data.message);
        toast.error(data.message);
        setStep("idle");
        return;
      }
      if (isMultipleOptions(data)) {
        setOptions(data.options);
        setStep("idle");
        return;
      }
      if (isRecipe(data)) {
        setRecipe(data);
        setStep("idle");
        return;
      }
      throw new Error("Resposta inesperada da IA");
    } catch (e: any) {
      console.error(e);
      const msg = e?.message ?? "Erro ao analisar a imagem.";
      setError(msg);
      toast.error(msg);
      setStep("idle");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectOption = useCallback(async (option: FastFoodOption) => {
    if (!imageBase64) {
      toast.error("Imagem não encontrada. Envie a foto novamente.");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      setStep("generating");

      const { data, error: fnErr } = await supabase.functions.invoke("generate-home-recipe", {
        body: { imageBase64, selectedOption: option },
      });

      if (fnErr) throw fnErr;
      if (isRecipeError(data)) {
        setError(data.message);
        toast.error(data.message);
        setStep("idle");
        return;
      }
      if (isRecipe(data)) {
        setRecipe(data);
        setOptions(null);
        setStep("idle");
        return;
      }
      throw new Error("Resposta inesperada da IA");
    } catch (e: any) {
      console.error(e);
      const msg = e?.message ?? "Erro ao gerar a receita.";
      setError(msg);
      toast.error(msg);
      setStep("idle");
    } finally {
      setIsLoading(false);
    }
  }, [imageBase64]);

  const saveRecipe = useCallback(async (userId: string) => {
    if (!recipe) return;
    const { error: insErr } = await supabase.from("recipes").insert({
      user_id: userId,
      nome: recipe.nome,
      recipe_data: recipe as any,
      image_url: null,
    });
    if (insErr) {
      console.error(insErr);
      toast.error("Não foi possível salvar a receita.");
      return false;
    }
    toast.success("Receita salva no seu histórico!");
    return true;
  }, [recipe]);

  return {
    step,
    isLoading,
    recipe,
    options,
    error,
    analyzeImage,
    selectOption,
    saveRecipe,
    reset,
  };
}
