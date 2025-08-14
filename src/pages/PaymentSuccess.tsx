
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

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    // Redireciona para a página de assinatura se não houver session_id
    if (!sessionId) {
      navigate('/quero-assinar', { replace: true });
    }
  }, [searchParams, navigate]);

  // Só renderiza se houver session_id
  const sessionId = searchParams.get('session_id');
  if (!sessionId) {
    return null;
  }

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
