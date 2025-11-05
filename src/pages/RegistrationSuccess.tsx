import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function RegistrationSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, planName, subscriptionEnd } = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navbar />
      
      <div className="pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-md">
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-white/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-20 h-20 text-green-500 animate-bounce" />
              </div>
              
              <CardTitle className="text-3xl font-bold mb-2">
                🎉 Cadastro realizado com sucesso!
              </CardTitle>
              
              <p className="text-lg text-muted-foreground">
                Bem-vindo ao FoodScan&Diet, <span className="font-semibold text-primary">{userName}</span>!
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {planName && subscriptionEnd && (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-6 text-center">
                  <p className="font-bold text-xl text-green-800 dark:text-green-400 mb-2">
                    ✅ Assinatura {planName} Ativada
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Válida até {new Date(subscriptionEnd).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              
              <div className="space-y-3 text-center">
                <p className="text-muted-foreground">
                  Sua conta está pronta! Agora você pode começar a usar todas as funcionalidades.
                </p>
              </div>
              
              <Button 
                onClick={() => navigate('/')} 
                className="w-full"
                size="lg"
              >
                🚀 Começar a usar agora
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
