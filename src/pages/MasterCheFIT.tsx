
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChefHat, Edit2, Save, X, Clock, Users, History, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

interface SavedMenuPlan {
  id: string;
  menu_data: MenuPlan;
  created_at: string;
}

const MasterCheFIT = () => {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteIngredients: '',
    specificRequirements: '',
    maxCalories: 2000
  });
  
  const [isEditing, setIsEditing] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [menuPlan, setMenuPlan] = useState<MenuPlan | null>(null);
  const [savedMenuPlans, setSavedMenuPlans] = useState<SavedMenuPlan[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  // Load user preferences and menu history on component mount
  useEffect(() => {
    if (user) {
      loadUserPreferences();
      loadMenuHistory();
    } else if (!loading) {
      setLoadingPreferences(false);
    }
  }, [user, loading]);

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_menu_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          favoriteIngredients: data.favorite_ingredients,
          specificRequirements: data.specific_requirements || '',
          maxCalories: data.max_calories
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas preferências.",
        variant: "destructive"
      });
    } finally {
      setLoadingPreferences(false);
    }
  };

  const loadMenuHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('user_menu_plans')
        .select('id, menu_data, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Type assertion para converter Json para MenuPlan usando unknown como intermediário
      const typedMenuPlans: SavedMenuPlan[] = (data || []).map(item => ({
        id: item.id,
        menu_data: item.menu_data as unknown as MenuPlan,
        created_at: item.created_at
      }));

      setSavedMenuPlans(typedMenuPlans);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar preferências.",
        variant: "destructive"
      });
      return;
    }

    if (!preferences.favoriteIngredients.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, adicione pelo menos alguns ingredientes favoritos.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Primeiro, verificar se o usuário já tem preferências
      const { data: existingPrefs } = await supabase
        .from('user_menu_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingPrefs) {
        // Se existir, fazer UPDATE
        const { error } = await supabase
          .from('user_menu_preferences')
          .update({
            favorite_ingredients: preferences.favoriteIngredients,
            specific_requirements: preferences.specificRequirements,
            max_calories: preferences.maxCalories,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Se não existir, fazer INSERT
        const { error } = await supabase
          .from('user_menu_preferences')
          .insert({
            user_id: user.id,
            favorite_ingredients: preferences.favoriteIngredients,
            specific_requirements: preferences.specificRequirements,
            max_calories: preferences.maxCalories
          });

        if (error) throw error;
      }

      setIsEditing(false);
      toast({
        title: "Preferências Salvas!",
        description: "Suas preferências foram registradas com sucesso."
      });
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas preferências.",
        variant: "destructive"
      });
    }
  };

  const generateMenuPlan = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para gerar cardápios.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-menu', {
        body: {
          favoriteIngredients: preferences.favoriteIngredients,
          specificRequirements: preferences.specificRequirements,
          maxCalories: preferences.maxCalories
        }
      });

      if (error) {
        throw error;
      }

      setMenuPlan(data);

      // Save the generated menu plan to database - convertendo UserPreferences para Json
      await supabase
        .from('user_menu_plans')
        .insert({
          user_id: user.id,
          menu_data: data as any, // Cast para Json
          preferences_snapshot: preferences as any // Cast para Json
        });

      // Reload menu history
      loadMenuHistory();
      
      toast({
        title: "Cardápio Gerado!",
        description: "Seu cardápio personalizado foi criado pela IA."
      });
    } catch (error) {
      console.error('Erro ao gerar cardápio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o cardápio. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSavedMenu = (savedMenu: SavedMenuPlan) => {
    setMenuPlan(savedMenu.menu_data);
    setShowHistory(false);
    toast({
      title: "Cardápio Carregado!",
      description: "Cardápio anterior foi carregado com sucesso."
    });
  };

  const deleteSavedMenu = async (menuId: string) => {
    try {
      const { error } = await supabase
        .from('user_menu_plans')
        .delete()
        .eq('id', menuId)
        .eq('user_id', user!.id);

      if (error) throw error;

      // Atualizar a lista local removendo o item deletado
      setSavedMenuPlans(prev => prev.filter(menu => menu.id !== menuId));
      
      toast({
        title: "Cardápio Removido!",
        description: "O cardápio foi removido com sucesso do seu histórico."
      });
    } catch (error) {
      console.error('Erro ao remover cardápio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o cardápio. Tente novamente.",
        variant: "destructive"
      });
    }
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

  // Show loading state while checking auth
  if (loading || loadingPreferences) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 font-inter pt-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <Footer />
      </>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 font-inter pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <ChefHat className="w-8 h-8 text-white" />
                <h1 className="text-3xl font-bold text-white">MasterCheFIT</h1>
              </div>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Acesso Restrito
                  </h2>
                  <p className="text-white/80 mb-6">
                    Você precisa estar logado para acessar o MasterCheFIT e criar seus cardápios personalizados.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    Fazer Login
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 font-inter pt-16">
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
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-white">Suas Preferências</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  {savedMenuPlans.length > 0 && (
                    <Button 
                      variant="default"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      <History className="w-4 h-4 mr-2" />
                      Histórico
                    </Button>
                  )}
                  {!isEditing ? (
                    <Button 
                      variant="default"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="bg-primary-500 hover:bg-primary-600 text-white"
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
                </div>
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

            {/* Menu History */}
            {showHistory && savedMenuPlans.length > 0 && (
              <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Cardápios Anteriores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {savedMenuPlans.map((savedMenu) => (
                      <div 
                        key={savedMenu.id}
                        className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-medium">
                            Cardápio de {new Date(savedMenu.created_at).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-white/60 text-sm">
                            {Object.values(savedMenu.menu_data).reduce((total, meal) => total + meal.calories, 0)} calorias total
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadSavedMenu(savedMenu)}
                            className="text-white hover:bg-white/20"
                          >
                            Carregar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSavedMenu(savedMenu.id)}
                            className="text-red-300 hover:bg-red-500/20 hover:text-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Menu Button */}
            {!isEditing && (
              <div className="text-center mb-8">
                <Button
                  onClick={generateMenuPlan}
                  disabled={isGenerating}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 text-base sm:px-8 sm:text-lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span className="hidden sm:inline">Gerando Cardápio...</span>
                      <span className="sm:hidden">Gerando...</span>
                    </>
                  ) : (
                    <>
                      <ChefHat className="w-5 h-5 mr-2" />
                      <span className="hidden sm:inline">Gerar Cardápio Personalizado</span>
                      <span className="sm:hidden">Gerar Cardápio</span>
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
      <Footer />
    </>
  );
};

export default MasterCheFIT;
