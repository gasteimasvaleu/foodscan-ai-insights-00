
import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { NutritionResults } from '@/components/NutritionResults';
import { LoadingState } from '@/components/LoadingState';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { toast } from '@/hooks/use-toast';

export interface NutritionData {
  foodName: string;
  description: string;
  nutrition: {
    calories: number;
    carbohydrates: number;
    proteins: number;
    fats: number;
    fiber: number;
    sodium: number;
  };
}

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const webhookUrl = 'https://hook.us2.make.com/wc5k9emyfv4xn9650bufvdwyi1drenof';

  const handleImageAnalysis = async (imageFile: File) => {
    setIsAnalyzing(true);
    console.log("Iniciando análise da imagem:", imageFile.name);

    try {
      // Convert image to base64
      const base64Image = await convertToBase64(imageFile);
      
      const payload = {
        image_data: base64Image,
        image_name: imageFile.name,
        timestamp: new Date().toISOString(),
        user_id: "user_" + Date.now()
      };

      console.log("Enviando dados para webhook:", webhookUrl);

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(payload),
      });

      // Simular resposta para demonstração (já que no-cors não retorna dados)
      setTimeout(() => {
        const mockData: NutritionData = {
          foodName: "Arroz com Feijão",
          description: "Prato tradicional brasileiro com arroz branco e feijão carioca, rico em carboidratos e proteínas vegetais.",
          nutrition: {
            calories: 350,
            carbohydrates: 65,
            proteins: 12,
            fats: 3,
            fiber: 8,
            sodium: 450
          }
        };

        setNutritionData(mockData);
        setIsAnalyzing(false);
        
        toast({
          title: "Análise concluída!",
          description: "Os dados nutricionais foram identificados com sucesso.",
        });
      }, 3000);

    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      setIsAnalyzing(false);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a imagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleReset = () => {
    setNutritionData(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-primary font-inter">
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Content */}
          {isAnalyzing ? (
            <LoadingState />
          ) : nutritionData ? (
            <NutritionResults data={nutritionData} onReset={handleReset} />
          ) : (
            <div className="space-y-8">
              <EmptyState />
              <ImageUpload onImageSelect={handleImageAnalysis} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
