import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Comunidade = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-6">Comunidade</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Conecte-se com outros usuários, compartilhe suas conquistas e inspire-se com histórias de transformação.
            </p>
            
            <div className="grid gap-6">
              <div className="bg-card rounded-lg p-6 border">
                <h2 className="text-2xl font-semibold text-card-foreground mb-4">
                  Bem-vindo à nossa Comunidade!
                </h2>
                <p className="text-muted-foreground">
                  Esta é a página da comunidade onde você poderá compartilhar suas experiências, 
                  ver o progresso de outros usuários e participar de discussões sobre nutrição e saúde.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Comunidade;