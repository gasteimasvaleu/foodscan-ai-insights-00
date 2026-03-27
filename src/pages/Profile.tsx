import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { User, Upload, Dumbbell, Calendar, Edit2, ClipboardList, Salad, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { NotificationSettings } from "@/components/NotificationSettings";

interface ProfileData {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  basal_metabolic_rate: number;
}

interface Goals {
  calories: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
  diet_objective: string;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadGoals();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditName(data.name);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const loadGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_goals")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setGoals(data);
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: editName })
        .eq("id", user?.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, name: editName } : null);
      toast({ title: "Nome atualizado com sucesso!" });
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
      toast({ title: "Erro ao atualizar nome", variant: "destructive" });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast({ title: "Foto de perfil atualizada!" });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({ title: "Erro ao atualizar foto", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center space-y-6">
              <h1 className="text-3xl font-bold text-gray-800">Acesso Restrito</h1>
              <p className="text-gray-600">
                Você precisa estar logado para acessar o seu perfil, retorne a página Inicial e faça seu login.
              </p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Retornar à Página Inicial
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  const memberSince = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-28 pt-[calc(env(safe-area-inset-top)+3.5rem)]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header do Perfil */}
        <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                    {profile?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-6 h-6 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <CardTitle className="text-3xl mb-2">{profile?.name}</CardTitle>
                <CardDescription className="text-base">{user?.email}</CardDescription>
                <p className="text-sm text-muted-foreground mt-1">Membro desde {memberSince}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
                    <DialogHeader>
                      <DialogTitle>Editar Perfil</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleUpdateName} className="w-full">
                        Salvar Alterações
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          </Card>

          {/* Ações Rápidas */}
          <Card className="mb-8 bg-[#FFD1E7] rounded-3xl shadow-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-semibold">Ações Rápidas</CardTitle>
              <CardDescription className="text-center">Acesse suas ferramentas de acompanhamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div
                  className="bg-[#F9FAFB] rounded-2xl flex flex-row items-center gap-4 py-4 px-5 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate("/profile/workout")}
                >
                  <Dumbbell className="h-8 w-8 text-pink-500 shrink-0" />
                  <div>
                    <p className="font-semibold">Ficha de Treino</p>
                    <p className="text-xs text-muted-foreground">Monte seu treino semanal</p>
                  </div>
                </div>
                <div
                  className="bg-[#F9FAFB] rounded-2xl flex flex-row items-center gap-4 py-4 px-5 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate("/profile/assessment")}
                >
                  <ClipboardList className="h-8 w-8 text-pink-500 shrink-0" />
                  <div>
                    <p className="font-semibold">Avaliação Física</p>
                    <p className="text-xs text-muted-foreground">Registre suas medidas</p>
                  </div>
                </div>
                <div
                  className="bg-[#F9FAFB] rounded-2xl flex flex-row items-center gap-4 py-4 px-5 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate("/profile/diets")}
                >
                  <Salad className="h-8 w-8 text-pink-500 shrink-0" />
                  <div>
                    <p className="font-semibold">Minhas Dietas</p>
                    <p className="text-xs text-muted-foreground">Monte sua dieta</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metas Atuais */}
          {goals && (
            <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-semibold">Metas Atuais</CardTitle>
                <CardDescription className="text-center">Objetivo: {goals.diet_objective}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">Calorias</span>
                    <span className="text-lg font-bold text-primary">{goals.calories} kcal</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">Carboidratos</span>
                    <span className="text-lg font-bold" style={{ color: '#FC45A0' }}>{goals.carbohydrates}g</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">Proteínas</span>
                    <span className="text-lg font-bold" style={{ color: '#FC45A0' }}>{goals.proteins}g</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">Gorduras</span>
                    <span className="text-lg font-bold" style={{ color: '#FC45A0' }}>{goals.fats}g</span>
                  </div>
                </div>
                <Button onClick={() => navigate("/controle-diario")} className="w-full mt-4" variant="outline">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar Metas
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notificações Push */}
          <NotificationSettings />

          {/* Configurações */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl mt-6">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-semibold">Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => navigate("/whatsapp-settings")} variant="outline" className="w-full justify-start">
                Configurações do WhatsApp
              </Button>
              <Button onClick={signOut} variant="destructive" className="w-full">
                Sair da Conta
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Minha Conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente, incluindo refeições, exercícios, dietas e avaliações físicas.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deletingAccount}
                      onClick={async (e) => {
                        e.preventDefault();
                        setDeletingAccount(true);
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          if (!session) throw new Error('Não autenticado');

                          const res = await supabase.functions.invoke('delete-account', {
                            headers: { Authorization: `Bearer ${session.access_token}` },
                          });

                          if (res.error) throw res.error;

                          await supabase.auth.signOut();
                          toast({ title: '✅ Conta excluída com sucesso.' });
                          navigate('/');
                        } catch (err: any) {
                          console.error('Delete account error:', err);
                          toast({ title: 'Erro ao excluir conta', description: err?.message || 'Tente novamente.', variant: 'destructive' });
                        } finally {
                          setDeletingAccount(false);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deletingAccount ? 'Excluindo...' : 'Sim, excluir minha conta'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
