
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Header } from '@/components/Header';
import { ImageUpload } from '@/components/ImageUpload';
import { NutritionResults } from '@/components/NutritionResults';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Camera, Target, BarChart3, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NutritionData } from '@/types/nutrition';

// Export the NutritionData type for backward compatibility
export type { NutritionData } from '@/types/nutrition';

const Index = () => {
  const { user, profile } = useAuth();
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageSelect = async (file: File) => {
    setIsAnalyzing(true);
    
    // Simular análise de IA
    setTimeout(() => {
      const mockData: NutritionData = {
        food_name: "Exemplo de Alimento",
        calories: 250,
        carbohydrates: 30,
        proteins: 15,
        fats: 10,
        portion: "1 porção",
        confidence: 95
      };
      setNutritionData(mockData);
      setIsAnalyzing(false);
    }, 3000);
  };

  const features = [
    {
      icon: Camera,
      title: "Escaneamento de Alimentos",
      description: "Use sua câmera para identificar alimentos instantaneamente"
    },
    {
      icon: Target,
      title: "Metas Personalizadas", 
      description: "Defina objetivos nutricionais adaptados ao seu perfil"
    },
    {
      icon: BarChart3,
      title: "Acompanhamento Detalhado",
      description: "Monitore calorias, proteínas, carboidratos e gorduras"
    },
    {
      icon: Brain,
      title: "Análise com IA",
      description: "Receba feedback inteligente sobre sua alimentação"
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <Header />
          
          {user && profile && (
            <div className="mb-8 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg inline-block">
              <p className="text-lg text-gray-700">
                Olá, <span className="font-semibold text-primary-600">{profile.name}</span>! 
                Bem-vindo de volta! 👋
              </p>
            </div>
          )}

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            {!nutritionData && !isAnalyzing && (
              <ImageUpload onImageSelect={handleImageSelect} />
            )}
            
            {isAnalyzing && <LoadingState />}
            
            {nutritionData && !isAnalyzing && (
              <NutritionResults data={nutritionData} />
            )}
            
            {!nutritionData && !isAnalyzing && <EmptyState />}
          </div>

          {/* Auth buttons for non-authenticated users */}
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/auth">
                <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Começar Agora
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50 rounded-xl px-8 py-4 text-lg font-semibold">
                  Fazer Login
                </Button>
              </Link>
            </div>
          )}

          {/* Link to Daily Control for authenticated users */}
          {user && (
            <div className="text-center mt-8">
              <Link to="/controle-diario">
                <Button className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Acessar Controle Diário
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma utiliza tecnologia avançada para tornar o controle nutricional simples e eficaz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="container mx-auto px-4 py-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Pronto para Começar?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de usuários que já transformaram sua alimentação com o FoodScan AI
              </p>
              <Link to="/auth">
                <Button className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-12 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Criar Conta Gratuita
                </Button>
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default Index;
