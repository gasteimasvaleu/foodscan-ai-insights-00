import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Camera, Construction } from 'lucide-react';

const Community = () => {
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

        {/* Construction Notice */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Construction className="mr-2 text-yellow-400" />
              Em Construção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80">
              A página da comunidade está sendo desenvolvida! Em breve você poderá:
            </p>
            <ul className="mt-4 space-y-2 text-white/70">
              <li>📸 Compartilhar fotos do antes e depois</li>
              <li>❤️ Curtir e comentar posts de outros usuários</li>
              <li>🏆 Ver o ranking dos usuários mais curtidos</li>
              <li>💬 Interagir com a comunidade</li>
              <li>🎯 Inspirar-se com histórias de sucesso</li>
            </ul>
          </CardContent>
        </Card>

        {/* Preview Ranking Card */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Trophy className="mr-2 text-yellow-400" />
              Top 5 - Mais Curtidos (Preview)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Maria Silva", likes: 245, posts: 12 },
                { name: "João Santos", likes: 198, posts: 8 },
                { name: "Ana Costa", likes: 156, posts: 15 },
                { name: "Pedro Lima", likes: 134, posts: 6 },
                { name: "Carla Rocha", likes: 98, posts: 9 }
              ].map((user, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant={index === 0 ? "default" : "secondary"} className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="text-white font-medium">{user.name}</span>
                  </div>
                  <div className="text-white/80 text-sm">
                    {user.likes} curtidas • {user.posts} posts
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            disabled
            className="bg-white/20 text-white cursor-not-allowed"
          >
            <Camera className="mr-2 h-4 w-4" />
            Compartilhar Evolução (Em breve)
          </Button>
          <p className="text-white/60 text-sm mt-2">
            Funcionalidade estará disponível em breve!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Community;