
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { AuthCard } from '@/components/AuthCard';
import { useAuth } from '@/hooks/useAuth';
import { Play, Clock, Flame, Search, Filter, Activity, Dumbbell, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GradientText } from '@/components/ui/gradient-text';
import { Footer } from '@/components/Footer';
import { VideoModal } from '@/components/VideoModal';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type WorkoutContent = Database['public']['Tables']['workout_content']['Row'];

const Treinos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<WorkoutContent[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutContent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutContent | null>(null);

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workouts:', error);
        return;
      }

      setWorkouts(data || []);
      setFilteredWorkouts(data || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWorkouts = () => {
    let filtered = workouts;

    if (searchTerm) {
      filtered = filtered.filter(workout =>
        workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.activity_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (contentTypeFilter !== 'all') {
      filtered = filtered.filter(workout => workout.content_type === contentTypeFilter);
    }

    if (activityTypeFilter !== 'all') {
      filtered = filtered.filter(workout => workout.activity_type === activityTypeFilter);
    }

    setFilteredWorkouts(filtered);
  };

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  useEffect(() => {
    filterWorkouts();
  }, [searchTerm, contentTypeFilter, activityTypeFilter, workouts]);

  const getUniqueActivityTypes = () => {
    const types = workouts.map(workout => workout.activity_type);
    return [...new Set(types)].sort();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setContentTypeFilter('all');
    setActivityTypeFilter('all');
  };

  const isValidVideoUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return url.includes('youtube.com') || url.includes('youtu.be') || url.endsWith('.mp4') || url.endsWith('.webm');
    } catch {
      return false;
    }
  };

  const handleWatchClick = (workout: WorkoutContent) => {
    console.log('handleWatchClick called:', workout);
    if (!isValidVideoUrl(workout.video_url)) {
      console.log('Invalid video URL:', workout.video_url);
      toast({
        title: "Erro",
        description: "URL de vídeo inválida para este treino.",
        variant: "destructive",
      });
      return;
    }
    console.log('Setting modal open with workout:', workout);
    setSelectedWorkout(workout);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedWorkout(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Navbar />
        <div className="pt-16">
          <AuthCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      
      <main className="pt-16 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-primary/20 shadow-xl backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-primary to-secondary p-4 rounded-full">
                      <Dumbbell className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <GradientText 
                  colors={["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--primary))"]} 
                  animationSpeed={4}
                  className="text-4xl md:text-5xl font-bold mb-4"
                >
                  Central de Treinos
                </GradientText>
                
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Descubra treinos personalizados e dicas profissionais para alcançar seus objetivos fitness
                </p>
                
                <div className="flex items-center justify-center space-x-6 mt-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">Treinos Profissionais</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">Dicas Exclusivas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">Resultados Garantidos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters Section */}
          <Card className="mb-8 shadow-lg border-primary/10">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {/* Search Input */}
                <div className="w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar treinos e dicas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-primary/20 focus:border-primary/40 w-full"
                    />
                  </div>
                </div>
                
                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                    <SelectTrigger className="w-full sm:w-40 border-primary/20">
                      <Filter className="w-4 h-4 mr-2 text-primary" />
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
                      <SelectItem value="workout">Treinos</SelectItem>
                      <SelectItem value="tip">Dicas</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                    <SelectTrigger className="w-full sm:w-40 border-primary/20">
                      <Activity className="w-4 h-4 mr-2 text-primary" />
                      <SelectValue placeholder="Atividade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Atividades</SelectItem>
                      {getUniqueActivityTypes().map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full sm:w-auto whitespace-nowrap border-primary/20 hover:bg-primary/5"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden shadow-lg">
                  <div className="relative">
                    <Skeleton className="w-full h-48" />
                    <div className="absolute top-3 left-3">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Content Grid */}
              {filteredWorkouts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWorkouts.map((workout) => (
                    <Card key={workout.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-primary/10 hover:border-primary/30">
                      <div className="relative">
                        {workout.thumbnail_url ? (
                          <img 
                            src={workout.thumbnail_url} 
                            alt={workout.title}
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 animate-gradient"></div>
                            <Activity className="w-12 h-12 text-primary relative z-10" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                          <Button 
                            size="lg" 
                            className="gap-2 bg-white/90 text-primary hover:bg-white transform scale-90 group-hover:scale-100 transition-all duration-300"
                            onClick={() => handleWatchClick(workout)}
                            disabled={!isValidVideoUrl(workout.video_url)}
                          >
                            <Play className="w-5 h-5" />
                            Assistir Agora
                          </Button>
                        </div>

                        <Badge 
                          variant={workout.content_type === 'workout' ? 'default' : 'secondary'}
                          className="absolute top-3 left-3 shadow-lg"
                        >
                          {workout.content_type === 'workout' ? '🏋️ Treino' : '💡 Dica'}
                        </Badge>
                      </div>

                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                          {workout.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                          {workout.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="p-1 bg-primary/10 rounded-full">
                              <Activity className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-foreground font-medium">{workout.activity_type}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {workout.duration && workout.duration > 0 && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-primary" />
                                <span className="font-medium">{workout.duration}min</span>
                              </div>
                            )}
                            {workout.calories && workout.calories > 0 && (
                              <div className="flex items-center gap-1">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span className="font-medium">{workout.calories}kcal</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="shadow-xl border-primary/20">
                  <CardContent className="text-center py-16">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-20 animate-pulse"></div>
                      <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                        <Activity className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      Nenhum treino encontrado
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Não encontramos treinos que correspondam aos seus filtros. Tente ajustar os critérios de busca.
                    </p>
                    <Button onClick={clearFilters} variant="outline" className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Limpar Todos os Filtros
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      <VideoModal 
        isOpen={isVideoModalOpen}
        onClose={closeVideoModal}
        workout={selectedWorkout}
      />

      <Footer />
    </div>
  );
};

export default Treinos;
