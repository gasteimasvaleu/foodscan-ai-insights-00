
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/subscription');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-center text-red-600 flex items-center justify-center gap-3">
                <XCircle className="w-8 h-8" />
                Pagamento Cancelado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-gray-700">
                Seu pagamento foi cancelado. Você pode tentar novamente ou voltar à página inicial.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleTryAgain}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  Tentar Novamente
                </Button>
                
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentCancel;
