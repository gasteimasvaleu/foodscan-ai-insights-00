
import React, { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const Success = () => {
  const { checkSubscription } = useAuth();

  useEffect(() => {
    // Verificar status da assinatura após sucesso do pagamento
    setTimeout(() => {
      checkSubscription();
    }, 2000);
  }, [checkSubscription]);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 animate-scale-in">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-success-100 rounded-full p-4">
                  <CheckCircle className="w-12 h-12 text-success-600" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-success-600 mb-2">
                Pagamento Realizado com Sucesso!
              </CardTitle>
              <p className="text-gray-600 text-lg">
                Bem-vindo ao FoodScan & Diet Premium!
              </p>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="space-y-4">
                <p className="text-gray-700">
                  Sua assinatura foi ativada e agora você tem acesso completo a todas as funcionalidades premium do FoodScan & Diet.
                </p>
                
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary-600 mb-2">O que você pode fazer agora:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Análise ilimitada de fotos de alimentos</li>
                    <li>✓ Relatórios nutricionais detalhados</li>
                    <li>✓ Acompanhamento diário personalizado</li>
                    <li>✓ Compartilhamento via WhatsApp</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Link to="/controle-diario">
                  <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                    Começar a Usar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/quero-assinar">
                  <Button variant="outline">
                    Ver Assinatura
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Success;
