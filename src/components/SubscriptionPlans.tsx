import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionPlan {
  name: string;
  price: string;
  priceId: string;
  tier: string;
  features: string[];
  popular?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    name: "Plano Mensal",
    price: "R$ 79,90",
    priceId: "price_1QhTAQL0hxV2jhvUzBjCOsng", // Substitua pelo seu price ID do Stripe
    tier: "Premium",
    features: [
      "Análise ilimitada de fotos",
      "Relatórios nutricionais detalhados",
      "Acompanhamento diário",
      "Compartilhamento WhatsApp",
      "MasterCheFIT completo",
      "ServiNUTRI completo",
      "Suporte prioritário"
    ]
  },
  {
    name: "Plano Anual",
    price: "R$ 799,00",
    priceId: "price_1QhTAQL0hxV2jhvUzBjCOsng", // Substitua pelo seu price ID do Stripe
    tier: "Premium Plus",
    popular: true,
    features: [
      "Tudo do plano mensal",
      "2 meses grátis",
      "Consultoria nutricional gratuita",
      "Planos alimentares exclusivos",
      "Acesso beta a novos recursos",
      "Suporte VIP 24/7"
    ]
  }
];

export const SubscriptionPlans = () => {
  const { user, subscription } = useAuth();

  const handleSubscribe = (priceId: string, tier: string) => {
    if (!user) {
      // Redirecionar para login se necessário
      window.location.href = '/auth';
      return;
    }

    subscription.createCheckout(priceId, tier);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {plans.map((plan) => (
        <Card 
          key={plan.name}
          className={`relative bg-white/90 backdrop-blur-sm shadow-xl border ${
            plan.popular ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-white/20'
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Mais Popular
              </div>
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-primary-600">
              {plan.name}
            </CardTitle>
            <div className="text-4xl font-bold text-gray-900 mt-2">
              {plan.price}
              {plan.name.includes('Mensal') && <span className="text-lg text-gray-600">/mês</span>}
              {plan.name.includes('Anual') && <span className="text-lg text-gray-600">/ano</span>}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button
              onClick={() => handleSubscribe(plan.priceId, plan.tier)}
              className={`w-full mt-6 ${
                plan.popular 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700' 
                  : ''
              }`}
              size="lg"
            >
              {subscription.subscriptionStatus.subscribed ? 'Trocar Plano' : 'Assinar Agora'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};