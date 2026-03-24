import React, { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { FoodNutritionResults } from '@/components/FoodNutritionResults';
import { LoadingState } from '@/components/LoadingState';
import { OpenFoodFactsLoadingState } from '@/components/OpenFoodFactsLoadingState';
import { EmptyState } from '@/components/EmptyState';
import { Navbar } from '@/components/Navbar';

import { AuthCard } from '@/components/AuthCard';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Scan } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { NutritionData, FoodElement } from '@/types/nutrition';
import { supabase } from '@/integrations/supabase/client';

const FoodScan = () => {
  const { user, loading } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBarcodeAnalyzing, setIsBarcodeAnalyzing] = useState(false);
  const [isDescribing, setIsDescribing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'fresh' | 'packaged'>('fresh');
  const [incompleteProductData, setIncompleteProductData] = useState<NutritionData | null>(null);
  
  // Removed exposed API key - now using secure Edge Functions

  // Show loading while checking authentication
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-primary font-inter pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </>
    );
  }

  // Show login form if user is not authenticated
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-primary font-inter pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Acesso Restrito
                </h1>
                <p className="text-gray-600 mb-8">
                  Você precisa estar logado para acessar o FoodScan
                </p>
              </div>
              <AuthCard mode="login" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const parseNutritionValue = (value: any): number => {
    console.log("Parsing nutrition value:", value, "Type:", typeof value);
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    if (typeof value === 'string') {
      const cleanValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
      const numericValue = parseFloat(cleanValue);
      return isNaN(numericValue) ? 0 : numericValue;
    }
    return 0;
  };

  const handleImageAnalysis = async (imageFile: File) => {
    setSelectedImage(URL.createObjectURL(imageFile));
    setIsDescribing(true);
    console.log("=== INICIANDO DESCRIÇÃO DA IMAGEM ===");
    try {
      const base64Full = await convertToBase64(imageFile);
      const base64Data = base64Full.split(',')[1]; // Remove the data:image/jpeg;base64, prefix
      
      // Use analyze-nutrition function with image data
      const { data, error } = await supabase.functions.invoke('analyze-nutrition', {
        body: { base64Image: base64Data }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.description) {
        throw new Error('Nenhuma descrição foi gerada');
      }

      setImageDescription(data.description);
      toast({
        title: "Descrição gerada!",
        description: "Agora você pode enviar para análise nutricional."
      });
    } catch (error) {
      console.error("Erro na descrição:", error);
      toast({
        title: "Erro na descrição",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsDescribing(false);
    }
  };


  const handleNutritionAnalysis = async () => {
    if (!imageDescription.trim()) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, gere a descrição da imagem primeiro.",
        variant: "destructive"
      });
      return;
    }
    setIsAnalyzing(true);
    console.log("=== INICIANDO ANÁLISE NUTRICIONAL ===");

    try {
      // Usar edge function diretamente em vez do webhook externo
      const { data, error } = await supabase.functions.invoke('analyze-nutrition', {
        body: { description: imageDescription }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("Dados da edge function:", data);
      const processedData = processOpenAIResponse(JSON.stringify(data));
      setNutritionData(processedData);
      
      toast({
        title: "Análise concluída!",
        description: "Os dados nutricionais foram calculados com sucesso.",
      });
    } catch (error) {
      console.error("Erro na análise nutricional:", error);
      toast({
        title: "Erro na análise nutricional",
        description: "Não foi possível analisar os dados nutricionais. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processOpenAIResponse = (responseText: string): NutritionData => {
    console.log("=== PROCESSANDO RESPOSTA DA OPENAI ===");
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("JSON parseado com sucesso:", data);
    } catch (parseError) {
      console.log("Não é JSON válido, processando como texto simples");
      data = parseTextResponse(responseText);
    }

    const processedData: NutritionData = {
      foodName: extractFoodName(data, responseText),
      description: extractDescription(data, responseText),
      quantity: extractQuantity(data, responseText),
      elements: extractElements(data),
      analysis_summary: data?.analysis_summary,
      overall_confidence: data?.overall_confidence,
      total_estimated_weight: data?.total_estimated_weight,
      cuisine_analysis: data?.cuisine_analysis ? {
        cooking_style: data.cuisine_analysis.cooking_style,
        complexity_level: data.cuisine_analysis.complexity_level,
        presentation_quality: data.cuisine_analysis.presentation_quality,
        temperature_indicators: data.cuisine_analysis.temperature_indicators
      } : undefined,
      nutrition: {
        calories: extractNutritionValue(data, responseText, ['calories', 'calorias', 'kcal']),
        carbohydrates: extractNutritionValue(data, responseText, ['carbohydrates', 'carboidratos', 'carbs']),
        proteins: extractNutritionValue(data, responseText, ['proteins', 'proteinas', 'protein']),
        fats: extractNutritionValue(data, responseText, ['fats', 'gorduras', 'fat', 'lipids']),
        fiber: extractNutritionValue(data, responseText, ['fiber', 'fibras', 'fibre']),
        sodium: extractNutritionValue(data, responseText, ['sodium', 'sodio', 'salt'])
      }
    };
    
    console.log("=== DADOS PROCESSADOS FINAL ===", processedData);
    return processedData;
  };

  const parseTextResponse = (text: string) => {
    const lines = text.split('\n');
    const result: any = {};
    lines.forEach(line => {
      const match = line.match(/([^:]+):\s*(\d+(?:\.\d+)?)/i);
      if (match) {
        const key = match[1].trim().toLowerCase();
        const value = parseFloat(match[2]);
        result[key] = value;
      }
    });
    return result;
  };

  const extractFoodName = (data: any, text: string): string => {
    if (data && typeof data === 'object') {
      return data.food_name || data.foodName || data.nome || data.alimento || data.nome_alimento || "Alimento identificado";
    }
    const foodMatch = text.match(/(?:alimento|food|nome):\s*([^\n]+)/i);
    return foodMatch ? foodMatch[1].trim() : "Alimento identificado";
  };

  const extractDescription = (data: any, text: string): string => {
    // Se data tem uma descrição direta (texto natural da API), usar ela
    if (data && typeof data === 'object' && data.description && typeof data.description === 'string') {
      return data.description;
    }
    
    // Fallback: usar o texto bruto se for string simples
    if (typeof text === 'string' && text.trim()) {
      return text.trim();
    }
    
    return "Informações nutricionais do alimento analisado.";
  };

  const extractQuantity = (data: any, text: string): string => {
    if (data && typeof data === 'object') {
      return data.quantidade_referencia || data.quantity || data.porção || data.portion || "100g";
    }
    const quantityMatch = text.match(/(?:quantidade|porção|portion):\s*([^\n]+)/i);
    return quantityMatch ? quantityMatch[1].trim() : "100g";
  };

  const extractNutritionValue = (data: any, text: string, keys: string[]): number => {
    if (data && typeof data === 'object') {
      for (const key of keys) {
        if (data[key] !== undefined) {
          return parseNutritionValue(data[key]);
        }
      }
    }
    for (const key of keys) {
      const regex = new RegExp(`${key}[^\\d]*([\\d,\\.]+)`, 'i');
      const match = text.match(regex);
      if (match) {
        return parseNutritionValue(match[1]);
      }
    }
    return 0;
  };

  const extractElements = (data: any): FoodElement[] | undefined => {
    console.log("=== EXTRAINDO ELEMENTOS ===", data);
    
    // Primeiro, tentar a nova estrutura foods_identified
    if (data && typeof data === 'object' && data.foods_identified && Array.isArray(data.foods_identified)) {
      console.log("Estrutura foods_identified encontrada:", data.foods_identified);
      
      return data.foods_identified.map((food: any) => ({
        name: food.name || "Elemento",
        description: food.detailed_description || food.description,
        detailed_description: food.detailed_description,
        category: food.category,
        preparation_analysis: food.preparation_analysis ? {
          primary_method: food.preparation_analysis.primary_method || "",
          secondary_methods: food.preparation_analysis.secondary_methods || [],
          cooking_tools: food.preparation_analysis.cooking_tools || [],
          cooking_indicators: food.preparation_analysis.cooking_indicators || "",
          estimated_cooking_time: food.preparation_analysis.estimated_cooking_time || "",
          cooking_level: food.preparation_analysis.cooking_level || ""
        } : undefined,
        texture_analysis: food.texture_analysis,
        color_analysis: food.color_analysis,
        size_reference: food.size_reference,
        confidence_level: food.confidence_level,
        quality_indicators: food.quality_indicators ? {
          freshness_signs: food.quality_indicators.freshness_signs || "",
          cooking_quality: food.quality_indicators.cooking_quality || "",
          visual_appeal: food.quality_indicators.visual_appeal || ""
        } : undefined,
        nutritional_preview: food.nutritional_preview ? {
          macronutrient_profile: food.nutritional_preview.macronutrient_profile || "",
          caloric_density: food.nutritional_preview.caloric_density || "",
          health_indicators: food.nutritional_preview.health_indicators || ""
        } : undefined,
        nutrition: {
          calories: parseNutritionValue(food.nutrition?.calories || 0),
          carbohydrates: parseNutritionValue(food.nutrition?.carbohydrates || 0),
          proteins: parseNutritionValue(food.nutrition?.proteins || 0),
          fats: parseNutritionValue(food.nutrition?.fats || 0),
          fiber: parseNutritionValue(food.nutrition?.fiber || 0),
          sodium: parseNutritionValue(food.nutrition?.sodium || 0)
        }
      }));
    }
    
    // Fallback para estrutura antiga (elementos)
    if (data && typeof data === 'object' && data.elementos && Array.isArray(data.elementos)) {
      console.log("Estrutura elementos (antiga) encontrada:", data.elementos);
      
      return data.elementos.map((elemento: any) => ({
        name: elemento.nome || elemento.name || "Elemento",
        nutrition: {
          calories: parseNutritionValue(elemento.calorias || elemento.calories || 0),
          carbohydrates: parseNutritionValue(elemento.carboidratos || elemento.carbohydrates || 0),
          proteins: parseNutritionValue(elemento.proteinas || elemento.proteins || 0),
          fats: parseNutritionValue(elemento.gorduras || elemento.fats || 0),
          fiber: parseNutritionValue(elemento.fibras || elemento.fiber || 0),
          sodium: parseNutritionValue(elemento.sodio || elemento.sodium || 0)
        }
      }));
    }
    
    // Fallback para estrutura elements (alternativa)
    if (data && typeof data === 'object' && data.elements && Array.isArray(data.elements)) {
      console.log("Estrutura elements encontrada:", data.elements);
      
      return data.elements.map((element: any) => ({
        name: element.name || "Elemento",
        description: element.description,
        nutrition: {
          calories: parseNutritionValue(element.nutrition?.calories || 0),
          carbohydrates: parseNutritionValue(element.nutrition?.carbohydrates || 0),
          proteins: parseNutritionValue(element.nutrition?.proteins || 0),
          fats: parseNutritionValue(element.nutrition?.fats || 0),
          fiber: parseNutritionValue(element.nutrition?.fiber || 0),
          sodium: parseNutritionValue(element.nutrition?.sodium || 0)
        }
      }));
    }
    
    // Se data é inválido ou não tem elementos, retornar undefined
    console.log("Nenhum elemento múltiplo detectado - data:", typeof data, data);
    return undefined;
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error("Erro ao converter imagem para base64"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Erro ao ler arquivo de imagem"));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBarcodeAnalysis = async (barcode: string) => {
    setIsBarcodeAnalyzing(true);
    console.log("=== INICIANDO ANÁLISE POR CÓDIGO DE BARRAS ===");
    console.log("Código de barras:", barcode);
    
    try {
      const { data, error } = await supabase.functions.invoke('open-food-facts', {
        body: { barcode }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Nenhum dado foi retornado');
      }

      console.log("Dados do Open Food Facts:", data);

      // Verificar se os dados nutricionais estão completos
      if (!data.hasNutritionalData) {
        console.log('Dados nutricionais incompletos, oferecendo fallback para IA');
        setIncompleteProductData(data);
        return;
      }

      // Converter os dados para o formato NutritionData
      const nutritionResult: NutritionData = {
        foodName: data.foodName,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        source: 'open-food-facts',
        nutriscore: data.nutriscore,
        brands: data.brands,
        barcode: data.barcode,
        nutrition: data.nutrition
      };

      setNutritionData(nutritionResult);
      toast({
        title: "Produto encontrado!",
        description: `Análise completa de ${data.name}`,
        variant: "default",
      });

    } catch (error: any) {
      console.error("Erro na análise por código de barras:", error);
      
      // Tentar extrair informações do erro da resposta
      let errorInfo = { canRetry: false, suggestAI: false };
      try {
        if (error.message) {
          const errorData = JSON.parse(error.message);
          errorInfo = {
            canRetry: errorData.canRetry || false,
            suggestAI: errorData.suggestAI || false
          };
        }
      } catch {
        // Se não conseguir parsear, manter valores padrão
      }
      
      // Armazenar código de barras para retry
      const barcodeForRetry = barcode;
      
      // Tratar diferentes tipos de erro
      if (error.message?.includes('404')) {
        toast({
          title: "Produto não encontrado",
          description: "Este código de barras não está na nossa base de dados. Que tal tentar uma análise por foto?",
          variant: "destructive",
        });
      } else if (error.message?.includes('503') || error.message?.includes('Erro de conectividade') || error.message?.includes('504')) {
        toast({
          title: "Problemas de conectividade",
          description: "Problemas temporários com o servidor. Tente novamente em alguns momentos.",
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setTimeout(() => handleBarcodeAnalysis(barcodeForRetry), 2000);
              }}
            >
              Tentar novamente
            </Button>
          )
        });
      } else if (error.message?.includes('Código de barras inválido')) {
        toast({
          title: "Código inválido",
          description: "O código de barras escaneado não é válido. Tente escanear novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro na análise",
          description: "Ocorreu um erro inesperado. Tente novamente ou use análise por foto.",
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleBarcodeAnalysis(barcodeForRetry)}
            >
              Tentar novamente
            </Button>
          )
        });
      }
    } finally {
      setIsBarcodeAnalyzing(false);
    }
  };

  const handleManualInput = async (description: string) => {
    setImageDescription(description);
    setSelectedImage(null);
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-nutrition', {
        body: { description }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("Dados da análise manual:", data);
      const processedData = processOpenAIResponse(JSON.stringify(data));
      setNutritionData(processedData);
      
      toast({
        title: "Análise concluída!",
        description: "Os dados nutricionais foram calculados com sucesso.",
      });
    } catch (error) {
      console.error("Erro na análise manual:", error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar os dados nutricionais. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setNutritionData(null);
    setImageDescription('');
    setSelectedImage(null);
    setIsAnalyzing(false);
    setIsBarcodeAnalyzing(false);
    setIsDescribing(false);
    setIncompleteProductData(null);
  };

  const handleFallbackToAI = async () => {
    if (!incompleteProductData) return;
    
    try {
      setIsAnalyzing(true);
      setIncompleteProductData(null);
      
      // Criar uma descrição baseada nos dados do Open Food Facts
      const description = `${incompleteProductData.foodName}${incompleteProductData.brands ? ` da marca ${incompleteProductData.brands}` : ''}`;
      
      // Chamar análise por IA usando os dados disponíveis
      const { data, error: functionError } = await supabase.functions.invoke('analyze-nutrition', {
        body: { 
          description,
          isFromBarcode: true,
          productName: incompleteProductData.foodName,
          brand: incompleteProductData.brands
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const aiNutritionData = processOpenAIResponse(JSON.stringify(data));
      
      // Combinar dados do Open Food Facts com análise IA
      const combinedData: NutritionData = {
        ...aiNutritionData,
        source: 'ai' as const,
        barcode: incompleteProductData.barcode,
        brands: incompleteProductData.brands,
        nutriscore: incompleteProductData.nutriscore,
        foodName: incompleteProductData.foodName
      };

      setNutritionData(combinedData);
      toast({
        title: "Análise complementada com IA!",
        description: "Dados nutricionais calculados usando inteligência artificial",
      });
    } catch (error) {
      console.error('Erro no fallback para IA:', error);
      toast({
        title: "Erro ao completar análise",
        description: "Não foi possível completar os dados com IA",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header Card */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-2xl opacity-70 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-green-400 to-emerald-500 p-6 rounded-3xl shadow-2xl">
                    <Scan className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 hover:scale-105 transition-transform duration-300">
                FoodScan
              </h1>
              
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Analise alimentos com inteligência artificial e descubra informações nutricionais detalhadas
              </p>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            {isBarcodeAnalyzing ? (
              <div data-results-section>
                <OpenFoodFactsLoadingState />
              </div>
            ) : (isAnalyzing || isDescribing) ? (
              <div data-results-section>
                <LoadingState />
              </div>
            ) : incompleteProductData ? (
              <div data-results-section className="space-y-6">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <Badge variant="outline" className="gap-2 border-amber-300 text-amber-700">
                      <BarChart3 className="w-3 h-3" />
                      Produto identificado - Dados incompletos
                    </Badge>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {incompleteProductData.foodName}
                    </h3>
                    
                    {incompleteProductData.brands && (
                      <p className="text-sm text-gray-600">
                        Marca: {incompleteProductData.brands}
                      </p>
                    )}
                    
                    <p className="text-amber-700 text-sm">
                      O produto foi encontrado no Open Food Facts, mas não possui dados nutricionais completos.
                    </p>
                    
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={handleFallbackToAI}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? "Analisando..." : "Completar com IA"}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleReset}
                      >
                        Nova Análise
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : nutritionData ? (
              <div data-results-section className="space-y-4">
                {nutritionData.source === 'open-food-facts' && (
                  <div className="text-center">
                    <Badge variant="secondary" className="gap-2">
                      <BarChart3 className="w-3 h-3" />
                      Dados do Open Food Facts
                    </Badge>
                  </div>
                )}
                {nutritionData.source === 'ai' && nutritionData.barcode && (
                  <div className="text-center">
                    <Badge variant="outline" className="gap-2 border-pink-300 text-pink-700">
                      <BarChart3 className="w-3 h-3" />
                      IA + Open Food Facts
                    </Badge>
                  </div>
                )}
                <FoodNutritionResults data={nutritionData} onReset={handleReset} />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl p-4 max-w-4xl mx-auto">
                  <ImageUpload 
                    onImageSelect={handleImageAnalysis} 
                    onBarcodeAnalysis={handleBarcodeAnalysis}
                    onManualInput={handleManualInput}
                    isAnalyzing={isAnalyzing || isBarcodeAnalyzing}
                  />
                </div>
                
                {(selectedImage || imageDescription) && (
                  <div data-description-section className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                          Descrição da Imagem
                        </h3>
                    
                    {selectedImage && (
                      <div className="mb-4 flex flex-col md:flex-row gap-4">
                        <img src={selectedImage} alt="Imagem selecionada" className="w-32 h-32 object-cover rounded-lg mx-auto md:mx-0" />
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex-1">
                          <div className="flex">
                            <div className="ml-3">
                              <p className="text-sm text-blue-700">
                                💡 <strong>Dica:</strong> Para uma análise mais refinada, você pode adicionar informações específicas no campo abaixo. 
                                Por exemplo: "café sem açúcar", "pizza margherita", "salada com azeite", etc.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {isDescribing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                        <span className="text-gray-600">Analisando imagem...</span>
                      </div>
                    ) : (
                      <>
                        <Textarea
                          value={imageDescription}
                          onChange={(e) => setImageDescription(e.target.value)}
                          placeholder="A descrição da imagem aparecerá aqui..."
                          className="min-h-[200px] md:min-h-[250px] mb-4"
                        />
                        
                        {imageDescription && (
                          <div className="flex justify-center">
                            <Button
                              onClick={handleNutritionAnalysis}
                              className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-8"
                            >
                              Analisar Nutrição
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FoodScan;
