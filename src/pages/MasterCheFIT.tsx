
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

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
      <div className="min-h-screen bg-gradient-primary pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12 p-8 rounded-3xl bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-2xl hover:shadow-primary/10 transition-all duration-500 animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 hover:scale-105 transition-transform duration-300">
                🍳 MasterCheFIT
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Crie cardápios personalizados baseados nos seus gostos e necessidades alimentares
              </p>
            </div>

            {/* Preferences Card */}
            <Card className="mb-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-primary/10 transition-all duration-500 animate-fade-in">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Suas Preferências Alimentares
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  {savedMenuPlans.length > 0 && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                      className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 hover:border-red-500/50 transition-all duration-300 hover:scale-105"
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
                      className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 hover:border-orange-500/50 transition-all duration-300 hover:scale-105"
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
                        className="hover:bg-white/20 transition-all duration-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={handleSavePreferences}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105"
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
                    <div className="group">
                      <Label htmlFor="ingredients" className="mb-2 block group-hover:text-primary transition-colors">
                        Ingredientes/Alimentos Favoritos
                      </Label>
                      <Textarea
                        id="ingredients"
                        placeholder="Ex: frango, salmão, arroz integral, banana, aveia, brócolis..."
                        value={preferences.favoriteIngredients}
                        onChange={(e) => setPreferences(prev => ({ ...prev, favoriteIngredients: e.target.value }))}
                        className="bg-white/10 backdrop-blur border-white/20 hover:border-orange-500/50 focus:border-orange-500 transition-all duration-300"
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
                        className="bg-white/10 backdrop-blur border-white/20 hover:border-red-500/50 focus:border-red-500 transition-all duration-300"
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
                        className="bg-white/10 backdrop-blur border-white/20 hover:border-pink-500/50 focus:border-pink-500 transition-all duration-300 w-48"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/15 border border-white/20 hover:bg-gradient-to-br hover:from-primary/20 hover:to-primary/25 transition-all duration-300">
                        <h4 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
                          <ChefHat className="w-4 h-4" />
                          INGREDIENTES FAVORITOS
                        </h4>
                        <p className="leading-relaxed text-white/90">{preferences.favoriteIngredients || 'Não definido'}</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/15 border border-white/20 hover:bg-gradient-to-br hover:from-primary/20 hover:to-primary/25 transition-all duration-300">
                        <h4 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          LIMITE CALÓRICO
                        </h4>
                        <p className="leading-relaxed text-white/90">{preferences.maxCalories} calorias no total</p>
                      </div>
                    </div>
                    
                    {preferences.specificRequirements && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-300">
                        <h4 className="font-semibold text-sm text-white/80 mb-2">ESPECIFICAÇÕES ESPECIAIS</h4>
                        <p className="text-sm leading-relaxed text-white/90">{preferences.specificRequirements}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu History */}
            {showHistory && savedMenuPlans.length > 0 && (
              <Card className="mb-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-primary/10 transition-all duration-500 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <History className="w-6 h-6 text-primary" />
                    Histórico de Cardápios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedMenuPlans.map((savedMenu, index) => (
                      <div 
                        key={savedMenu.id}
                        className="p-4 border border-white/20 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                             <h3 className="font-semibold text-lg text-white/95">
                               Cardápio de {new Date(savedMenu.created_at).toLocaleDateString('pt-BR')}
                             </h3>
                            <div className="flex items-center gap-4 text-sm text-white/80">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary"></div>
                                <span>Total:</span>
                                <span className="font-semibold text-primary">
                                  {Object.values(savedMenu.menu_data).reduce((total, meal) => total + meal.calories, 0)} kcal
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadSavedMenu(savedMenu)}
                              className="flex items-center gap-1 bg-white/10 backdrop-blur border-white/20 hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-300"
                            >
                              <Eye className="w-3 h-3" />
                              Ver
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteSavedMenu(savedMenu.id)}
                              className="flex items-center gap-1 hover:scale-105 transition-transform duration-200"
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
              <div className="text-center mb-8">
                <Button
                  onClick={generateMenuPlan}
                  disabled={isGenerating}
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 shadow-2xl hover:shadow-primary-500/25 transition-all duration-500 hover:scale-105 animate-pulse hover:animate-none"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      <span className="hidden sm:inline">Gerando seu cardápio personalizado...</span>
                      <span className="sm:hidden">Gerando...</span>
                    </>
                  ) : (
                    <>
                      <ChefHat className="w-5 h-5 mr-2 animate-bounce" />
                      <span className="hidden sm:inline">Gerar Cardápio Personalizado</span>
                      <span className="sm:hidden">Gerar Cardápio</span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Menu Plan */}
            {menuPlan && (
              <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent mb-4">
                    🍽️ Seu Cardápio Personalizado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {Object.entries(menuPlan).map(([mealType, meal], index) => (
                      <div 
                        key={mealType} 
                        className="border border-white/20 rounded-xl p-6 bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl group"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{getMealIcon(mealType)}</span>
                          <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">{getMealName(mealType)}</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors text-white/95">{meal.name}</h4>
                            <p className="text-white/80 mb-3 leading-relaxed">{meal.recipe}</p>
                          </div>
                          
                          <div className="bg-white/5 backdrop-blur p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                            <h5 className="font-medium mb-2 text-primary">Modo de Preparo:</h5>
                            <p className="text-sm leading-relaxed whitespace-pre-line text-white/85">{meal.instructions}</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-primary/25 border border-primary/30">
                              <span className="font-medium">Calorias:</span>
                              <span className="text-primary font-bold">{meal.calories} kcal</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200">
                              <Clock className="w-4 h-4 text-blue-400" />
                              <span>{meal.time}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200">
                              <Users className="w-4 h-4 text-green-400" />
                              <span>{meal.servings} porções</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Summary */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl animate-fade-in hover:shadow-primary/20 transition-all duration-500">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold mb-3 flex items-center justify-center gap-2">
                          <span className="text-2xl">📊</span>
                          Resumo Nutricional do Dia
                        </h3>
                        <div className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                          <p className="text-3xl font-bold mb-1">
                            {Object.values(menuPlan).reduce((total, meal) => total + meal.calories, 0)} kcal
                          </p>
                          <p className="text-sm opacity-80">Total do cardápio completo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MasterCheFIT;
