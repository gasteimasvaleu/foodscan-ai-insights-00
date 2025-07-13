import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Camera, Trophy, Users, UserCheck, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommunityPost {
  id: string;
  user_id: string;
  before_photo_url?: string;
  after_photo_url?: string;
  description: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    name: string;
  };
}

interface TopUser {
  user_id: string;
  total_likes: number;
  posts_count: number;
  name: string;
}

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [userProfile, setUserProfile] = useState<{id: string, name: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    description: '',
    beforePhoto: null as File | null,
    afterPhoto: null as File | null,
  });

  useEffect(() => {
    fetchPosts();
    fetchTopUsers();
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      // Buscar posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Buscar perfis dos usuários
      if (postsData && postsData.length > 0) {
        const userIds = [...new Set(postsData.map(post => post.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Combinar dados
        const profilesMap = profilesData?.reduce((acc: any, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        const postsWithProfiles = postsData.map(post => ({
          ...post,
          profiles: {
            name: profilesMap[post.user_id]?.name || 'Usuário'
          }
        }));

        setPosts(postsWithProfiles);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopUsers = async () => {
    try {
      // Buscar posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('user_id, likes_count');

      if (postsError) throw postsError;

      if (postsData && postsData.length > 0) {
        // Buscar perfis
        const userIds = [...new Set(postsData.map(post => post.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const profilesMap = profilesData?.reduce((acc: any, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        // Calcular ranking dos usuários
        const userStats = postsData.reduce((acc: any, post) => {
          const userId = post.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              total_likes: 0,
              posts_count: 0,
              name: profilesMap[userId]?.name || 'Usuário',
            };
          }
          acc[userId].total_likes += post.likes_count;
          acc[userId].posts_count += 1;
          return acc;
        }, {});

        const topUsersArray = Object.values(userStats) as TopUser[];
        topUsersArray.sort((a, b) => b.total_likes - a.total_likes);
        setTopUsers(topUsersArray.slice(0, 5));
      } else {
        setTopUsers([]);
      }
    } catch (error) {
      console.error('Error fetching top users:', error);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      alert('Faça login para curtir posts');
      return;
    }

    try {
      // Verificar se já curtiu
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Remover curtida
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Adicionar curtida
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
      }

      fetchPosts();
      fetchTopUsers();
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const uploadImage = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('community-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('community-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleCreatePost = async () => {
    if (!user) {
      alert('Faça login para criar posts');
      return;
    }

    if (!newPost.description.trim()) {
      alert('Adicione uma descrição ao seu post');
      return;
    }

    try {
      let beforePhotoUrl = '';
      let afterPhotoUrl = '';

      if (newPost.beforePhoto) {
        beforePhotoUrl = await uploadImage(newPost.beforePhoto, 'before');
      }

      if (newPost.afterPhoto) {
        afterPhotoUrl = await uploadImage(newPost.afterPhoto, 'after');
      }

      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          description: newPost.description,
          before_photo_url: beforePhotoUrl || null,
          after_photo_url: afterPhotoUrl || null,
        });

      if (error) throw error;

      alert('Post criado com sucesso!');
      setNewPost({ description: '', beforePhoto: null, afterPhoto: null });
      setShowCreatePost(false);
      fetchPosts();
      fetchTopUsers();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Erro ao criar post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Carregando comunidade...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            <Users className="inline-block mr-2 mb-1" />
            Comunidade FoodScan
          </h1>
          <p className="text-white/80 text-lg">
            Compartilhe sua jornada e inspire outros!
          </p>
        </div>

        {/* Card de Boas-vindas para usuário logado */}
        {user && userProfile && (
          <Card className="mb-8 bg-gradient-to-r from-success/20 to-primary/20 backdrop-blur-sm border-success/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <UserCheck className="mr-2 text-success" />
                Bem-vindo à Comunidade!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-success text-white text-lg">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium text-lg">{userProfile.name}</p>
                  <p className="text-white/80 text-sm">
                    Pronto para compartilhar sua evolução e inspirar outros!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aviso para usuários não logados */}
        {!user && (
          <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lock className="mr-2 text-yellow-400" />
                Acesso Restrito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-white/80 text-lg mb-4">
                  Faça login para participar da comunidade e compartilhar sua evolução!
                </p>
                <Button 
                  onClick={() => navigate('/')}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  Fazer Login
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ranking Card */}
        {topUsers.length > 0 && (
          <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="mr-2 text-yellow-400" />
                Top 5 - Mais Curtidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topUsers.map((topUser, index) => (
                  <div key={topUser.user_id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <Badge variant={index === 0 ? "default" : "secondary"} className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="text-white font-medium">{topUser.name}</span>
                    </div>
                    <div className="text-white/80 text-sm">
                      {topUser.total_likes} curtidas • {topUser.posts_count} posts
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Post Button - Apenas para usuários logados */}
        {user && userProfile && (
          <div className="mb-8 text-center">
            <Button 
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="bg-white text-primary hover:bg-white/90"
            >
              <Camera className="mr-2 h-4 w-4" />
              {showCreatePost ? 'Cancelar Post' : 'Compartilhar Evolução'}
            </Button>
          </div>
        )}

        {/* Create Post Form - Apenas para usuários logados */}
        {user && showCreatePost && (
          <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Camera className="mr-2" />
                Compartilhe sua evolução
              </CardTitle>
              <p className="text-white/80 text-sm mt-2">
                Conte sua história de transformação e inspire outros membros da comunidade!
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Sua História de Transformação *
                </label>
                <Textarea
                  placeholder="Conte sobre sua jornada: O que te motivou? Quais foram os desafios? Como foi o processo? Quais resultados você alcançou? Inspire outros com sua história!"
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[120px]"
                  rows={5}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    📸 Foto "Antes" (Opcional)
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewPost({ ...newPost, beforePhoto: e.target.files?.[0] || null })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-white/60 text-xs mt-1">
                    Compartilhe como você estava no início da jornada
                  </p>
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    🎉 Foto "Depois" (Opcional)
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewPost({ ...newPost, afterPhoto: e.target.files?.[0] || null })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-white/60 text-xs mt-1">
                    Mostre seus resultados e conquistas
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleCreatePost} 
                  className="bg-success hover:bg-success/90 flex-1"
                  disabled={!newPost.description.trim()}
                >
                  🚀 Publicar Minha História
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreatePost(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-white/60 mb-4" />
                <p className="text-white/80 text-lg">
                  Seja o primeiro a compartilhar sua evolução!
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-white">
                        {post.profiles.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{post.profiles.name}</p>
                      <p className="text-white/60 text-sm">
                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-white">{post.description}</p>
                  
                  {(post.before_photo_url || post.after_photo_url) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {post.before_photo_url && (
                        <div>
                          <p className="text-white/80 text-sm mb-2 font-medium">Antes</p>
                          <img 
                            src={post.before_photo_url} 
                            alt="Antes" 
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      {post.after_photo_url && (
                        <div>
                          <p className="text-white/80 text-sm mb-2 font-medium">Depois</p>
                          <img 
                            src={post.after_photo_url} 
                            alt="Depois" 
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 pt-4 border-t border-white/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className="text-white hover:bg-white/10"
                    >
                      <Heart className="mr-1 h-4 w-4" />
                      {post.likes_count}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      <MessageCircle className="mr-1 h-4 w-4" />
                      {post.comments_count}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;