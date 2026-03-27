import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Shield, Trash2, Upload, GripVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Banner {
  id: string;
  image_url: string;
  storage_path: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const AdminBanners = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingBanners, setLoadingBanners] = useState(true);

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

  useEffect(() => {
    if (isAdmin) fetchBanners();
  }, [isAdmin]);

  const fetchBanners = async () => {
    setLoadingBanners(true);
    const { data, error } = await supabase
      .from('homepage_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) setBanners(data);
    setLoadingBanners(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Arquivo inválido', description: 'Selecione uma imagem.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banners/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('criativos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('criativos').getPublicUrl(fileName);

      const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.display_order)) : -1;

      const { error: insertError } = await supabase
        .from('homepage_banners')
        .insert({
          image_url: publicUrl,
          storage_path: fileName,
          display_order: maxOrder + 1,
        });

      if (insertError) throw insertError;

      toast({ title: '✅ Banner adicionado!' });
      fetchBanners();
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm('Excluir este banner?')) return;

    try {
      await supabase.storage.from('criativos').remove([banner.storage_path]);
      const { error } = await supabase.from('homepage_banners').delete().eq('id', banner.id);
      if (error) throw error;
      toast({ title: 'Banner excluído' });
      fetchBanners();
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' });
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= banners.length) return;

    const a = banners[index];
    const b = banners[swapIndex];

    await Promise.all([
      supabase.from('homepage_banners').update({ display_order: b.display_order }).eq('id', a.id),
      supabase.from('homepage_banners').update({ display_order: a.display_order }).eq('id', b.id),
    ]);

    fetchBanners();
  };

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

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Banners</h1>
            <p className="text-sm text-muted-foreground">Gerencie os banners da página principal</p>
          </div>
        </div>

        {/* Upload */}
        <Card>
          <CardContent className="p-4">
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {uploading ? 'Enviando...' : 'Clique para enviar uma imagem 16:9'}
              </span>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </CardContent>
        </Card>

        {/* Banner list */}
        {loadingBanners ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : banners.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum banner cadastrado. O banner padrão será exibido.</p>
        ) : (
          <div className="space-y-3">
            {banners.map((banner, index) => (
              <Card key={banner.id} className="overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveOrder(index, 'up')}
                      disabled={index === 0}
                    >
                      ▲
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveOrder(index, 'down')}
                      disabled={index === banners.length - 1}
                    >
                      ▼
                    </Button>
                  </div>
                  <div className="flex-1">
                    <img
                      src={banner.image_url}
                      alt={`Banner ${index + 1}`}
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(banner)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBanners;
