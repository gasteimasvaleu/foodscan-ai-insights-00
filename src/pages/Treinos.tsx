import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Flame, Search, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/AuthCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "@/hooks/use-toast";

interface WorkoutContent {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  estimated_calories: number;
  duration_minutes: number;
  content_type: 'treino' | 'dica';
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
}

export default function Treinos() {
  const { user, loading } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutContent[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutContent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState<string>("all");
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("all");
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  useEffect(() => {
    filterWorkouts();
  }, [workouts, searchTerm, contentTypeFilter, activityTypeFilter]);

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_content')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar os treinos.",
        variant: "destructive",
      });
    } finally {
      setLoadingContent(false);
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

    if (contentTypeFilter !== "all") {
      filtered = filtered.filter(workout => workout.content_type === contentTypeFilter);
    }

    if (activityTypeFilter !== "all") {
      filtered = filtered.filter(workout => workout.activity_type === activityTypeFilter);
    }

    setFilteredWorkouts(filtered);
  };

  const getUniqueActivityTypes = () => {
    const types = [...new Set(workouts.map(w => w.activity_type))];
    return types.sort();
  };

  if (loading) return <LoadingState />;
  if (!user) return <AuthCard mode="login" />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Treinos</h1>
          <p className="text-muted-foreground">
            Explore vídeos de treinos e dicas de exercícios para todos os níveis
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar treinos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de conteúdo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="treino">Treinos</SelectItem>
                  <SelectItem value="dica">Dicas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de atividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {getUniqueActivityTypes().map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setContentTypeFilter("all");
                  setActivityTypeFilter("all");
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grid de conteúdos */}
        {loadingContent ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg"></div>
                <CardContent className="pt-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground mb-4">
                <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Nenhum treino encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou buscar por outros termos</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorkouts.map((workout) => (
              <Card key={workout.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative group">
                  {workout.thumbnail_url ? (
                    <img 
                      src={workout.thumbnail_url} 
                      alt={workout.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <Play className="w-12 h-12 text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="lg" className="rounded-full">
                      <Play className="w-6 h-6 ml-1" />
                    </Button>
                  </div>
                  <Badge 
                    variant={workout.content_type === 'treino' ? 'default' : 'secondary'}
                    className="absolute top-2 right-2"
                  >
                    {workout.content_type === 'treino' ? 'Treino' : 'Dica'}
                  </Badge>
                </div>
                
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{workout.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{workout.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      {workout.activity_type}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {workout.duration_minutes} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      ~{workout.estimated_calories} cal
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}