import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, MessageCircle, Upload, Camera, Users, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CommunityPost {
  id: string;
  user_id: string;
  description: string;
  before_photo_url?: string;
  after_photo_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

export default function Comunidade() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    user_name: '',
    city: '',
    state: '',
    description: '',
    before_photo: null as File | null,
    after_photo: null as File | null
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts:', error);
    } else {
      setPosts(data || []);
    }
  };

  const uploadPhoto = async (file: File, type: 'before' | 'after') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${type}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('community-photos')
      .upload(filePath, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('community-photos')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_name || !formData.city || !formData.state || !formData.description) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let beforePhotoUrl = '';
      let afterPhotoUrl = '';

      if (formData.before_photo) {
        beforePhotoUrl = await uploadPhoto(formData.before_photo, 'before');
      }

      if (formData.after_photo) {
        afterPhotoUrl = await uploadPhoto(formData.after_photo, 'after');
      }

      const postDescription = `${formData.user_name} - ${formData.city}, ${formData.state}\n\n${formData.description}`;
      
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: 'anonymous',
          description: postDescription,
          before_photo_url: beforePhotoUrl || null,
          after_photo_url: afterPhotoUrl || null
        });

      if (error) throw error;

      toast({
        title: "Sucesso! 🎉",
        description: "Seu depoimento foi enviado e está inspirando outras pessoas!"
      });

      setFormData({
        user_name: '',
        city: '',
        state: '',
        description: '',
        before_photo: null,
        after_photo: null
      });

      fetchPosts();
    } catch (error) {
      console.error('Erro ao enviar depoimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar depoimento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: 'anonymous' });

    if (!error) {
      fetchPosts();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-variant py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Users className="w-16 h-16 mb-4" />
                <Sparkles className="w-6 h-6 absolute -top-2 -right-2 text-accent animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-accent bg-clip-text text-transparent">
              Comunidade FoodScan
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Transformações reais, histórias inspiradoras! Compartilhe sua jornada e inspire milhares de pessoas.
            </p>
            <div className="flex justify-center space-x-8 text-white/80">
              <div className="text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Resultados Reais</span>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Comunidade Unida</span>
              </div>
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Inspiração Diária</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário de Envio */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-2xl border-0 bg-gradient-to-br from-white to-primary/5">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                  <Camera className="w-6 h-6" />
                  Compartilhe sua História
                </CardTitle>
                <p className="text-muted-foreground">Inspire outras pessoas com sua transformação!</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="user_name" className="text-primary font-medium">Nome *</Label>
                    <Input
                      id="user_name"
                      value={formData.user_name}
                      onChange={(e) => setFormData({...formData, user_name: e.target.value})}
                      placeholder="Seu nome"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-primary font-medium">Cidade *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Sua cidade"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-primary font-medium">Estado *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        placeholder="UF"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-primary font-medium">Sua História *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Conte sua história de transformação..."
                      className="mt-1 min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-primary font-medium">Foto ANTES (opcional)</Label>
                      <div className="mt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFormData({...formData, before_photo: e.target.files?.[0] || null})}
                          className="hidden"
                          id="before-photo"
                        />
                        <Label htmlFor="before-photo" className="cursor-pointer">
                          <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/60 transition-colors">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <span className="text-sm text-muted-foreground">
                              {formData.before_photo ? formData.before_photo.name : 'Clique para enviar foto ANTES'}
                            </span>
                          </div>
                        </Label>
                      </div>
                    </div>

                    <div>
                      <Label className="text-primary font-medium">Foto DEPOIS (opcional)</Label>
                      <div className="mt-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFormData({...formData, after_photo: e.target.files?.[0] || null})}
                          className="hidden"
                          id="after-photo"
                        />
                        <Label htmlFor="after-photo" className="cursor-pointer">
                          <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/60 transition-colors">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <span className="text-sm text-muted-foreground">
                              {formData.after_photo ? formData.after_photo.name : 'Clique para enviar foto DEPOIS'}
                            </span>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-primary-variant hover:from-primary-variant hover:to-primary text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isSubmitting ? 'Enviando...' : 'Compartilhar História 🚀'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Feed de Posts */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary mb-2">Histórias de Sucesso</h2>
                <p className="text-muted-foreground">Veja as transformações incríveis da nossa comunidade</p>
              </div>

              {posts.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Seja o primeiro!</h3>
                    <p className="text-muted-foreground">Ainda não temos depoimentos. Que tal ser o primeiro a inspirar nossa comunidade?</p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-white to-primary/5">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(post.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        <Trophy className="w-6 h-6 text-accent" />
                      </div>

                      <p className="mb-4 text-gray-700 leading-relaxed whitespace-pre-line">{post.description}</p>

                      {(post.before_photo_url || post.after_photo_url) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {post.before_photo_url && (
                            <div className="relative group">
                              <img
                                src={post.before_photo_url}
                                alt="Antes"
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                              />
                              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                ANTES
                              </div>
                            </div>
                          )}
                          {post.after_photo_url && (
                            <div className="relative group">
                              <img
                                src={post.after_photo_url}
                                alt="Depois"
                                className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                              />
                              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                DEPOIS
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            {post.likes_count}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {post.comments_count}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}