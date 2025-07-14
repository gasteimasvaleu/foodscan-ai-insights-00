import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';

export const HowItWorksCard = () => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl animate-fade-in">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Como Funciona o FoodScan
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubra como nossa tecnologia revoluciona sua alimentação em apenas alguns passos simples
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Imagem à esquerda */}
          <div className="relative group">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl p-4 hover:shadow-lg transition-shadow duration-300">
              <img 
                src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/sign/criativos/image12%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTk4Mzc3ZS0wZjU2LTQxYTItOGZhZS04OTFkM2ZlNzc5NmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjcmlhdGl2b3MvaW1hZ2UxMiAoMSkucG5nIiwiaWF0IjoxNzUyNTA2NjQ5LCJleHAiOjE3ODQwNDI2NDl9.E4xKfoHnE_uvh_aw1WHzFOUv3sGe0b6Dvxj-K_0zJxc"
                alt="Análise nutricional inteligente"
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Tecnologia Avançada
              </h3>
              <p className="text-sm text-gray-600">
                IA que reconhece alimentos e calcula valores nutricionais instantaneamente
              </p>
            </div>
          </div>
          
          {/* Vídeo à direita */}
          <div className="relative group">
            <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl p-4 hover:shadow-lg transition-shadow duration-300">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <video 
                  className="w-full h-64 object-cover"
                  poster="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fX0%3D&auto=format&fit=crop&w=1000&q=80"
                  controls
                  preload="metadata"
                >
                  <source src="#" type="video/mp4" />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <Play className="w-16 h-16 mx-auto mb-2 opacity-80" />
                      <p className="text-sm">Vídeo demonstrativo em breve</p>
                    </div>
                  </div>
                </video>
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                  <div className="bg-white/90 rounded-full p-4 shadow-lg">
                    <Play className="w-8 h-8 text-primary-600" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Demonstração Prática
              </h3>
              <p className="text-sm text-gray-600">
                Veja como é fácil analisar suas refeições e controlar sua dieta
              </p>
            </div>
          </div>
        </div>
        
        {/* Passos do processo */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">
              1
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Fotografe</h4>
            <p className="text-xs text-gray-600">Tire uma foto da sua refeição</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">
              2
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Analise</h4>
            <p className="text-xs text-gray-600">IA identifica e calcula nutrientes</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">
              3
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Acompanhe</h4>
            <p className="text-xs text-gray-600">Monitore suas metas diárias</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};