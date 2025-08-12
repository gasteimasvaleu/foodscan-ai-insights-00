
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/AuthCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoadingState } from "@/components/LoadingState";
import { VideoUpload } from "@/components/VideoUpload";
import { ThumbnailUpload } from "@/components/ThumbnailUpload";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type WorkoutContent = Database['public']['Tables']['workout_content']['Row'];

interface FormData {
  title: string;
  description: string;
  activity_type: string;
  duration: number;
  calories: number;
  content_type: 'workout' | 'tip';
  video_url: string;
  thumbnail_url: string;
  is_active: boolean;
}

const initialFormData: FormData = {
  title: "",
  description: "",
  activity_type: "",
  duration: 0,
  calories: 0,
  content_type: "workout",
  video_url: "",
  thumbnail_url: "",
  is_active: true,
};

export default function AdminTreinos() {
  const { user, loading } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutContent[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminRole();
      fetchWorkouts();
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .rpc('has_role', { 
          _user_id: user?.id, 
          _role: 'admin' 
        });

      if (error) throw error;
      setIsAdmin(data);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } finally {
      setCheckingRole(false);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_content')
        .select('*')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const workoutData = {
        title: formData.title,
        description: formData.description,
        activity_type: formData.activity_type,
        duration: formData.duration || null,
        calories: formData.calories || null,
        content_type: formData.content_type,
        video_url: formData.video_url || null,
        thumbnail_url: formData.thumbnail_url || null,
        is_active: formData.is_active,
      };

      let result;
      if (editingId) {
        result = await supabase
          .from('workout_content')
          .update(workoutData)
          .eq('id', editingId);
      } else {
        result = await supabase
          .from('workout_content')
          .insert([workoutData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Sucesso",
        description: editingId ? "Treino atualizado com sucesso!" : "Treino criado com sucesso!",
      });

      setDialogOpen(false);
      setEditingId(null);
      setFormData(initialFormData);
      fetchWorkouts();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o treino.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (workout: WorkoutContent) => {
    setFormData({
      title: workout.title,
      description: workout.description,
      activity_type: workout.activity_type,
      duration: workout.duration || 0,
      calories: workout.calories || 0,
      content_type: workout.content_type as 'workout' | 'tip',
      video_url: workout.video_url || "",
      thumbnail_url: workout.thumbnail_url || "",
      is_active: workout.is_active,
    });
    setEditingId(workout.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workout_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Treino excluído com sucesso!",
      });

      fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir o treino.",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('workout_content')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Treino ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`,
      });

      fetchWorkouts();
    } catch (error) {
      console.error('Error toggling workout status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do treino.",
        variant: "destructive",
      });
    }
  };

  if (loading || checkingRole) return <LoadingState />;
  if (!user) return <AuthCard mode="login" />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
              <p className="text-muted-foreground">
                Você precisa de permissões de administrador para acessar esta página.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin - Treinos</h1>
            <p className="text-muted-foreground">
              Gerencie o conteúdo de treinos e dicas
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setFormData(initialFormData);
                setEditingId(null);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Treino
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar Treino' : 'Novo Treino'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="activity_type">Tipo de Atividade *</Label>
                    <Input
                      id="activity_type"
                      value={formData.activity_type}
                      onChange={(e) => setFormData({...formData, activity_type: e.target.value})}
                      placeholder="Ex: Cardio, Musculação, Yoga"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="content_type">Tipo de Conteúdo *</Label>
                    <Select 
                      value={formData.content_type} 
                      onValueChange={(value) => setFormData({...formData, content_type: value as 'workout' | 'tip'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workout">Treino</SelectItem>
                        <SelectItem value="tip">Dica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duração (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="calories">Calorias (estimativa)</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({...formData, calories: parseInt(e.target.value) || 0})}
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <VideoUpload
                    onVideoSelect={(url) => setFormData({...formData, video_url: url})}
                    onRemove={() => setFormData({...formData, video_url: ""})}
                    currentUrl={formData.video_url}
                    label="Vídeo do Treino"
                  />
                  
                  <ThumbnailUpload
                    onThumbnailSelect={(url) => setFormData({...formData, thumbnail_url: url})}
                    onRemove={() => setFormData({...formData, thumbnail_url: ""})}
                    currentUrl={formData.thumbnail_url}
                    label="Thumbnail do Treino"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Ativo</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de treinos */}
        {loadingContent ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
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
        ) : workouts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">Nenhum treino cadastrado ainda</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro treino
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <Card key={workout.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{workout.title}</h3>
                        <Badge variant={workout.content_type === 'workout' ? 'default' : 'secondary'}>
                          {workout.content_type === 'workout' ? 'Treino' : 'Dica'}
                        </Badge>
                        <Badge variant="outline">{workout.activity_type}</Badge>
                        {workout.is_active ? (
                          <Badge variant="default" className="bg-green-500">
                            <Eye className="w-3 h-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-2 line-clamp-2">{workout.description}</p>
                      
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {workout.duration && <span>{workout.duration} min</span>}
                        {workout.calories && <span>~{workout.calories} cal</span>}
                        <span>Criado em {new Date(workout.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(workout.id, workout.is_active)}
                      >
                        {workout.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(workout)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir treino</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o treino "{workout.title}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(workout.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
