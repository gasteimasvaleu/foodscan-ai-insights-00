import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export const HowItWorksCard = () => {
  return <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Como Funciona o FoodScan
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Descubra como nosso app revoluciona sua alimentação em poucos passos
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Imagem do lado esquerdo */}
          <div className="order-2 md:order-1">
            <img alt="Como usar o FoodScan" className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md" src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/sign/criativos/image12%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTk4Mzc3ZS0wZjU2LTQxYTItOGZhZS04OTFkM2ZlNzc5NmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjcmlhdGl2b3MvaW1hZ2UxMiAoMSkucG5nIiwiaWF0IjoxNzUyNTA0NDUwLCJleHAiOjE3ODQwNDA0NTB9.JbdCe9JMHmsP1ZbwN32rNHhsbZkpYVR7By99Pf4zYbU" />
          </div>
          
          {/* Vídeo do lado direito */}
          <div className="order-1 md:order-2">
            <div className="aspect-video bg-gray-100 rounded-lg shadow-md overflow-hidden">
              <video className="w-full h-full object-cover" poster="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" controls preload="metadata">
                <source src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/sign/criativos/0713.mov?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZTk4Mzc3ZS0wZjU2LTQxYTItOGZhZS04OTFkM2ZlNzc5NmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjcmlhdGl2b3MvMDcxMy5tb3YiLCJpYXQiOjE3NTI1MDQ0OTMsImV4cCI6MTc4NDA0MDQ5M30.GaxBZto0lq8csIMDhrXBqMH5DAdNJMZ7umB5U0PU7QQ" type="video/mp4" />
                <p className="p-4 text-center text-gray-600">
                  Seu navegador não suporta vídeos. 
                  <a href="/demo-video.mp4" className="text-primary underline ml-1">
                    Clique aqui para assistir
                  </a>
                </p>
              </video>
            </div>
          </div>
        </div>
        
        {/* Passos explicativos */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Tire uma Foto</h3>
            <p className="text-sm text-gray-600">
              Fotografe seu prato ou escaneie o código de barras do alimento
            </p>
          </div>
          
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Análise Instantânea</h3>
            <p className="text-sm text-gray-600">
              Nossa IA identifica o alimento e calcula os valores nutricionais
            </p>
          </div>
          
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Acompanhe Metas</h3>
            <p className="text-sm text-gray-600">
              Monitore suas calorias e macronutrientes para atingir seus objetivos
            </p>
          </div>
        </div>
      </CardContent>
    </Card>;
};