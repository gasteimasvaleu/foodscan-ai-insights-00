import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Tag, ArrowLeft, Shield, ImageIcon, ShoppingBag, MessageCircle, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      setIsAdmin(!!data);
      setCheckingRole(false);
    };
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else {
        checkAdmin();
      }
    }
  }, [user, loading, navigate]);

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Shield className="mx-auto h-12 w-12 text-destructive mb-2" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você não tem permissão para acessar esta área.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} variant="outline">Voltar ao início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminPages = [
    {
      title: 'Banners',
      description: 'Gerenciar banners da página principal',
      icon: ImageIcon,
      path: '/admin/banners',
    },
    {
      title: 'Treinos',
      description: 'Gerenciar conteúdo de treinos e vídeos',
      icon: Dumbbell,
      path: '/admin/treinos',
    },
    {
      title: 'Loja',
      description: 'Gerenciar produtos de afiliado da loja',
      icon: ShoppingBag,
      path: '/admin/loja',
    },
    {
      title: 'Chat ao vivo',
      description: 'Moderar denúncias e gerenciar palavras banidas',
      icon: MessageCircle,
      path: '/admin/chat',
    },
    {
      title: 'Alimentos da comunidade',
      description: 'Aprovar sugestões geradas pelas refeições dos usuários',
      icon: Apple,
      path: '/admin/alimentos-comunidade',
    },
    {
      title: 'Assinaturas Promocionais',
      description: 'Enviar convites e tokens de acesso por email',
      icon: Tag,
      path: '/admin/assinaturas-promocionais',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Gerencie os recursos do aplicativo</p>
          </div>
        </div>

        <div className="grid gap-4">
          {adminPages.map((page) => (
            <Card
              key={page.path}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(page.path)}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-3 rounded-xl bg-primary/10">
                  <page.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{page.title}</CardTitle>
                  <CardDescription>{page.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
