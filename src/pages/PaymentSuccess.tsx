
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PaymentRegistrationForm } from '@/components/PaymentRegistrationForm';

const PaymentSuccess = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Auto-check subscription after successful payment (only for logged users)
    if (user && subscription.checkSubscription) {
      const timer = setTimeout(() => {
        subscription.checkSubscription();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, subscription]);

  // If user is not logged in, show registration form
  if (!user && sessionId) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        
        <div className="pt-32 px-4">
          <div className="container mx-auto max-w-md">
            <PaymentRegistrationForm sessionId={sessionId} />
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navbar />
      
      <div className="pt-32 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 text-center">
            <CardContent className="p-12">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-success-100 rounded-full p-4">
                  <CheckCircle className="w-12 h-12 text-success-600" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Pagamento Realizado com Sucesso!
              </h1>
              
              <p className="text-gray-600 mb-8 text-lg">
                Sua assinatura foi ativada e você já pode usar todos os recursos premium do We Diet.
              </p>

              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/foodscan')}
                  className="w-full"
                  size="lg"
                >
                  Começar a Usar
                </Button>
                
                <Button 
                  onClick={() => navigate('/quero-assinar')}
                  variant="outline"
                  className="w-full"
                >
                  Ver Status da Assinatura
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

export default PaymentSuccess;
