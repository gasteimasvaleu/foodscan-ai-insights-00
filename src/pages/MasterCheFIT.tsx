
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';

import { AuthCard } from '@/components/AuthCard';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChefHat, Edit2, Save, X, Clock, Users, History, Trash2, Target, Eye } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-primary font-inter pt-16 pb-28 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-primary pt-16 pb-28">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Acesso Restrito</h1>
                <p className="text-gray-600 mb-8">Você precisa estar logado para acessar o MasterCheFIT</p>
              </div>
              <AuthCard mode="login" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary pt-16 pb-28">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="mb-6 animate-fade-in">
              <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-[#FD46A1]">MasterCheFIT</h1>
              </div>
            </div>

            {/* Preferences Card */}
            <Card className="mb-8 bg-[#FFD1E7] backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 animate-fade-in">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-2xl text-center w-full">
                  Preferências Alimentares
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  {savedMenuPlans.length > 0 && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                      className="bg-white border-white/20 hover:bg-white/90 transition-all duration-300 hover:scale-105"
                    >
                      <History className="w-4 h-4 mr-2" />
                      Histórico
                    </Button>
                  )}
                  {!isEditing ? (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="bg-white border-white/20 hover:bg-white/90 transition-all duration-300 hover:scale-105"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={handleSavePreferences}
                        className="flex-1 bg-gradient-to-r from-primary to-primary hover:from-primary/80 hover:to-primary/80 shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gradient-to-r from-primary to-primary hover:from-primary/80 hover:to-primary/80 shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="group">
                      <Label htmlFor="ingredients" className="mb-2 block group-hover:text-primary transition-colors">
                        Ingredientes/Alimentos Favoritos
                      </Label>
                      <Textarea
                        id="ingredients"
                        placeholder="Ex: frango, salmão, arroz integral, banana, aveia, brócolis..."
                        value={preferences.favoriteIngredients}
                        onChange={(e) => setPreferences(prev => ({ ...prev, favoriteIngredients: e.target.value }))}
                         className="bg-white backdrop-blur border-white/20 hover:border-primary/50 focus:border-primary transition-all duration-300"
                        rows={3}
                      />
                    </div>

                    <div className="group">
                      <Label htmlFor="requirements" className="mb-2 block group-hover:text-primary transition-colors">
                        Especificações Especiais
                      </Label>
                      <Textarea
                        id="requirements"
                        placeholder="Ex: sem glúten, vegano, baixo sódio, rico em proteína..."
                        value={preferences.specificRequirements}
                        onChange={(e) => setPreferences(prev => ({ ...prev, specificRequirements: e.target.value }))}
                        className="bg-white/10 backdrop-blur border-white/20 hover:border-primary/50 focus:border-primary transition-all duration-300"
                        rows={2}
                      />
                    </div>

                    <div className="group">
                      <Label htmlFor="calories" className="mb-2 block group-hover:text-primary transition-colors">
                        Máximo de Calorias do Cardápio Completo
                      </Label>
                      <Input
                        id="calories"
                        type="number"
                        min="1000"
                        max="4000"
                        value={preferences.maxCalories}
                        onChange={(e) => setPreferences(prev => ({ ...prev, maxCalories: parseInt(e.target.value) || 2000 }))}
                        className="bg-white/10 backdrop-blur border-white/20 hover:border-primary/50 focus:border-primary transition-all duration-300 w-48"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl bg-[#F9FAFB] border border-white/20">
                        <h4 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
                          <ChefHat className="w-4 h-4" />
                          INGREDIENTES FAVORITOS
                        </h4>
                        <p className="leading-relaxed text-gray-800">{preferences.favoriteIngredients || 'Não definido'}</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-[#F9FAFB] border border-white/20">
                        <h4 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          LIMITE CALÓRICO
                        </h4>
                        <p className="leading-relaxed text-gray-800">{preferences.maxCalories} calorias no total</p>
                      </div>
                    </div>
                    
                    {preferences.specificRequirements && (
                      <div className="p-4 rounded-xl bg-[#F9FAFB] border border-white/20">
                        <h4 className="font-semibold text-sm text-primary mb-2">ESPECIFICAÇÕES ESPECIAIS</h4>
                        <p className="text-sm leading-relaxed text-gray-800">{preferences.specificRequirements}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu History */}
            {showHistory && savedMenuPlans.length > 0 && (
              <Card className="mb-8 bg-[#FFD1E7] rounded-3xl shadow-xl border border-white/20 transition-all duration-500 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">
                    Histórico de Cardápios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedMenuPlans.map((savedMenu, index) => (
                      <div
                        key={savedMenu.id}
                        className="p-4 border border-white/20 rounded-xl bg-[#F9FAFB] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex flex-col gap-4">
                          <div>
                             <h3 className="font-semibold text-lg text-gray-800">
                               Cardápio de {new Date(savedMenu.created_at).toLocaleDateString('pt-BR')}
                             </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary"></div>
                                <span>Total:</span>
                                <span className="font-semibold text-primary">
                                  {Object.values(savedMenu.menu_data).reduce((total, meal) => total + meal.calories, 0)} kcal
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadSavedMenu(savedMenu)}
                              className="flex-1 justify-center flex items-center gap-1 bg-white/10 backdrop-blur border-white/20 hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-300"
                            >
                              <Eye className="w-3 h-3" />
                              Ver
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteSavedMenu(savedMenu.id)}
                              className="flex-1 justify-center flex items-center gap-1 hover:scale-105 transition-transform duration-200"
                            >
                              <Trash2 className="w-3 h-3" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Menu Button */}
            {!isEditing && (
              <div className="mb-8">
                <Button
                  onClick={generateMenuPlan}
                  disabled={isGenerating}
                  size="lg"
                  className="w-full py-4 text-lg font-semibold bg-[#FD46A1] hover:bg-[#FD46A1]/80 shadow-2xl hover:shadow-[#FD46A1]/25 transition-all duration-500 hover:scale-105"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      <span className="hidden sm:inline">Gerando seu cardápio personalizado...</span>
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
              <div className="animate-fade-in">
                <h2 className="text-center text-2xl font-bold text-gray-800 mb-8">
                  Seu Cardápio Personalizado
                </h2>
                <div className="grid gap-6">
                  {Object.entries(menuPlan).map(([mealType, meal]: [string, Meal]) => (
                    <div key={mealType} className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                      <div className="relative bg-[#F9FAFB] rounded-xl p-6 border border-white/20 hover:border-primary/40 transition-all duration-300 shadow-xl hover:shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {getMealIcon(mealType)}
                            {getMealName(mealType)}
                          </h3>
                          <span className="px-3 py-1 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium border border-primary/30">
                            {meal.calories} kcal
                          </span>
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2">{meal.name}</h4>
                          <p className="text-sm text-black whitespace-pre-line">{meal.recipe}</p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Modo de Preparo</h4>
                          <p className="text-sm text-black whitespace-pre-line">{meal.instructions}</p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-black">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{meal.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{meal.servings} {meal.servings === 1 ? 'porção' : 'porções'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
