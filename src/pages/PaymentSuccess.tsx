
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { PaymentRegistrationForm } from '@/components/PaymentRegistrationForm';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  console.log('PaymentSuccess - sessionId:', sessionId);
  console.log('PaymentSuccess - searchParams:', searchParams.toString());

  useEffect(() => {
    console.log('PaymentSuccess useEffect - sessionId:', sessionId);
    
    // Só redireciona se realmente não houver session_id após um delay
    if (!sessionId) {
      console.log('No session_id found, redirecting to subscription page');
      const timer = setTimeout(() => {
        navigate('/quero-assinar', { replace: true });
      }, 2000); // 2 segundos de delay para debugging
      
      return () => clearTimeout(timer);
    }
  }, [sessionId, navigate]);

  // Se não há sessionId, mostra mensagem de carregamento por 2 segundos
  if (!sessionId) {
    console.log('Rendering loading state - no sessionId');
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-white text-center">
          <p>Carregando informações do pagamento...</p>
          <p className="text-sm mt-2">Redirecionando em alguns segundos...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering PaymentSuccess with sessionId:', sessionId);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Success Message */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 mb-8 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-center text-success-600 flex items-center justify-center gap-3">
                <CheckCircle className="w-8 h-8" />
                Pagamento Realizado com Sucesso!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-700 mb-4">
                Seu pagamento foi processado com sucesso. Agora você pode criar sua conta para começar a usar o FoodScan & Diet.
              </p>
              <p className="text-sm text-gray-500">
                ID da Sessão: {sessionId}
              </p>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <PaymentRegistrationForm sessionId={sessionId} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
