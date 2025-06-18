
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChefHat, Edit2, Save, X, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserPreferences {
  favoriteIngredients: string;
  specificRequirements: string;
  maxCalories: number;
}

interface Meal {
  name: string;
  recipe: string;
  instructions: string;
  calories: number;
  time: string;
  servings: number;
}

interface MenuPlan {
  breakfast: Meal;
  morningSnack: Meal;
  lunch: Meal;
  afternoonSnack: Meal;
  dinner: Meal;
}

const MasterCheFIT = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteIngredients: '',
    specificRequirements: '',
    maxCalories: 2000
  });
  
  const [isEditing, setIsEditing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [menuPlan, setMenuPlan] = useState<MenuPlan | null>(null);

  const handleSavePreferences = () => {
    if (!preferences.favoriteIngredients.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, adicione pelo menos alguns ingredientes favoritos.",
        variant: "destructive"
      });
      return;
    }
    
    setIsEditing(false);
    toast({
      title: "Preferências Salvas!",
      description: "Suas preferências foram registradas com sucesso."
    });
  };

  const generateMenuPlan = async () => {
    setIsGenerating(true);
    
    // Distribui as calorias entre as refeições (percentuais aproximados)
    const calorieDistribution = {
      breakfast: 0.25,      // 25%
      morningSnack: 0.10,   // 10%
      lunch: 0.35,          // 35%
      afternoonSnack: 0.10, // 10%
      dinner: 0.20          // 20%
    };
    
    // Simulação de geração de cardápio (aqui você pode integrar com OpenAI posteriormente)
    setTimeout(() => {
      const sampleMenu: MenuPlan = {
        breakfast: {
          name: "Smoothie Proteico com Aveia",
          recipe: `${preferences.favoriteIngredients.includes('banana') ? 'Banana, ' : ''}Aveia, whey protein, leite desnatado, mel`,
          instructions: "1. Bata todos os ingredientes no liquidificador\n2. Sirva gelado\n3. Adicione granola por cima se desejar",
          calories: Math.round(preferences.maxCalories * calorieDistribution.breakfast),
          time: "10 min",
          servings: 1
        },
        morningSnack: {
          name: "Mix de Castanhas",
          recipe: "Castanha do Pará, amêndoas, nozes",
          instructions: "1. Misture as castanhas em um recipiente\n2. Consuma uma porção pequena",
          calories: Math.round(preferences.maxCalories * calorieDistribution.morningSnack),
          time: "2 min",
          servings: 1
        },
        lunch: {
          name: "Peito de Frango Grelhado",
          recipe: `Peito de frango, ${preferences.favoriteIngredients.includes('arroz') ? 'arroz integral, ' : 'quinoa, '}salada verde, azeite`,
          instructions: "1. Tempere o frango com sal, pimenta e ervas\n2. Grelhe por 6-8 minutos cada lado\n3. Sirva com acompanhamentos",
          calories: Math.round(preferences.maxCalories * calorieDistribution.lunch),
          time: "25 min",
          servings: 1
        },
        afternoonSnack: {
          name: "Iogurte com Frutas",
          recipe: "Iogurte grego natural, frutas vermelhas, chia",
          instructions: "1. Coloque o iogurte em uma tigela\n2. Adicione as frutas por cima\n3. Polvilhe chia",
          calories: Math.round(preferences.maxCalories * calorieDistribution.afternoonSnack),
          time: "5 min",
          servings: 1
        },
        dinner: {
          name: "Salmão com Legumes",
          recipe: "Filé de salmão, brócolis, cenoura, batata doce",
          instructions: "1. Tempere o salmão e asse por 15 min\n2. Refogue os legumes no vapor\n3. Sirva junto com batata doce cozida",
          calories: Math.round(preferences.maxCalories * calorieDistribution.dinner),
          time: "30 min",
          servings: 1
        }
      };
      
      setMenuPlan(sampleMenu);
      setIsGenerating(false);
      
      toast({
        title: "Cardápio Gerado!",
        description: "Seu cardápio personalizado está pronto."
      });
    }, 3000);
  };

  const getMealIcon = (mealType: string) => {
    switch(mealType) {
      case 'breakfast': return '🌅';
      case 'morningSnack': return '🍎';
      case 'lunch': return '🍽️';
      case 'afternoonSnack': return '🥤';
      case 'dinner': return '🌙';
      default: return '🍴';
    }
  };

  const getMealName = (mealType: string) => {
    switch(mealType) {
      case 'breakfast': return 'Café da Manhã';
      case 'morningSnack': return 'Lanche da Manhã';
      case 'lunch': return 'Almoço';
      case 'afternoonSnack': return 'Lanche da Tarde';
      case 'dinner': return 'Jantar';
      default: return mealType;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary font-inter pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="flex items-center justify-center gap-3 mb-4">
                <ChefHat className="w-8 h-8 text-white" />
                <h1 className="text-3xl font-bold text-white">MasterCheFIT</h1>
              </div>
              <p className="text-white/80 text-lg">
                Crie cardápios personalizados baseados nos seus gostos e necessidades
              </p>
            </div>

            {/* Preferences Card */}
            <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Suas Preferências</CardTitle>
                {!isEditing ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-white hover:bg-white/20"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handleSavePreferences}
                      className="bg-primary-500 hover:bg-primary-600"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="ingredients" className="text-white mb-2 block">
                        Ingredientes/Alimentos Favoritos
                      </Label>
                      <Textarea
                        id="ingredients"
                        placeholder="Ex: frango, salmão, arroz integral, banana, aveia, brócolis..."
                        value={preferences.favoriteIngredients}
                        onChange={(e) => setPreferences(prev => ({ ...prev, favoriteIngredients: e.target.value }))}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="requirements" className="text-white mb-2 block">
                        Especificações Especiais
                      </Label>
                      <Textarea
                        id="requirements"
                        placeholder="Ex: sem glúten, vegano, baixo sódio, rico em proteína..."
                        value={preferences.specificRequirements}
                        onChange={(e) => setPreferences(prev => ({ ...prev, specificRequirements: e.target.value }))}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="calories" className="text-white mb-2 block">
                        Máximo de Calorias do Cardápio Completo
                      </Label>
                      <Input
                        id="calories"
                        type="number"
                        min="1000"
                        max="4000"
                        value={preferences.maxCalories}
                        onChange={(e) => setPreferences(prev => ({ ...prev, maxCalories: parseInt(e.target.value) || 2000 }))}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60 w-48"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Ingredientes Favoritos:</h4>
                      <p className="text-white/80">{preferences.favoriteIngredients || 'Não definido'}</p>
                    </div>
                    
                    {preferences.specificRequirements && (
                      <div>
                        <h4 className="text-white font-medium mb-2">Especificações:</h4>
                        <p className="text-white/80">{preferences.specificRequirements}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Máximo de Calorias do Cardápio:</h4>
                      <p className="text-white/80">{preferences.maxCalories} calorias no total</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate Menu Button */}
            {!isEditing && (
              <div className="text-center mb-8">
                <Button
                  onClick={generateMenuPlan}
                  disabled={isGenerating}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando Cardápio...
                    </>
                  ) : (
                    <>
                      <ChefHat className="w-5 h-5 mr-2" />
                      Gerar Cardápio Personalizado
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Menu Plan */}
            {menuPlan && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                  Seu Cardápio Personalizado
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(menuPlan).map(([mealType, meal]) => (
                    <Card key={mealType} className="bg-white/10 backdrop-blur-sm border-white/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <span className="text-2xl">{getMealIcon(mealType)}</span>
                          {getMealName(mealType)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-white mb-1">{meal.name}</h4>
                          <p className="text-white/70 text-sm">{meal.recipe}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-white/80">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {meal.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {meal.servings} porção
                          </div>
                        </div>
                        
                        <div className="bg-primary-500/20 rounded-lg p-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{meal.calories}</div>
                            <div className="text-white/80 text-sm">calorias</div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-white mb-2">Modo de Preparo:</h5>
                          <div className="text-white/80 text-sm whitespace-pre-line">
                            {meal.instructions}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    Resumo Nutricional do Dia
                  </h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {Object.values(menuPlan).reduce((total, meal) => total + meal.calories, 0)} calorias
                    </div>
                    <p className="text-white/80">Total do cardápio completo</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MasterCheFIT;
