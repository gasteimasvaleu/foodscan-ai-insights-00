import React from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionPlan {
  name: string;
  price: string;
  priceId: string;
  tier: string;
  features: string[];
  popular?: boolean;
  monthlyPrice: string;
  description: string;
  isAnnual?: boolean;
  paymentMethod?: 'stripe' | 'hotmart';
  checkoutUrl?: string;
}

const plans: SubscriptionPlan[] = [
  {
    name: "Plano Mensal",
    price: "R$ 47,90",
    monthlyPrice: "47,90",
    priceId: "price_1S1DVHDRCKC0uz7XWvTY0A9Q",
    tier: "Premium",
    description: "Perfeito para começar sua jornada",
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
    price: "R$ 429,90",
    monthlyPrice: "35,83",
    priceId: "price_1S1DTGDRCKC0uz7XiI5I3WgL",
    tier: "Premium Plus",
    popular: true,
    isAnnual: true,
    description: "Melhor custo-benefício + 25% de desconto",
    features: [
      "Tudo do plano mensal",
      "25% de desconto (equivale a 3 meses grátis)",
      "Consultoria nutricional gratuita",
      "Planos alimentares exclusivos",
      "Acesso beta a novos recursos",
      "Suporte VIP 24/7"
    ]
  }
];

const hotmartPlans: SubscriptionPlan[] = [
  {
    name: "Plano Mensal - PIX",
    price: "R$ 47,90",
    monthlyPrice: "47,90",
    priceId: "",
    tier: "Premium",
    description: "Pagamento via PIX - Acesso em até 1 hora",
    paymentMethod: "hotmart",
    checkoutUrl: "https://pay.hotmart.com/M102508523B",
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
    name: "Plano Anual - PIX",
    price: "R$ 429,90",
    monthlyPrice: "35,83",
    priceId: "",
    tier: "Premium Plus",
    popular: true,
    isAnnual: true,
    description: "PIX com 25% OFF - Acesso em até 1 hora",
    paymentMethod: "hotmart",
    checkoutUrl: "https://pay.hotmart.com/I102508582U",
    features: [
      "Tudo do plano mensal",
      "25% de desconto (3 meses grátis)",
      "Consultoria nutricional gratuita",
      "Planos alimentares exclusivos",
      "Acesso beta a novos recursos",
      "Suporte VIP 24/7"
    ]
  }
];

// Background components from the original squishy-pricing
const BGComponent1 = () => (
  <svg
    width="340"
    height="340"
    viewBox="0 0 340 340"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0 h-full w-full"
  >
    <motion.circle
      cx="170"
      cy="170"
      r="120"
      fill="hsl(var(--primary) / 0.1)"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1.1, opacity: 1 }}
      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
    />
    <motion.circle
      cx="170"
      cy="170"
      r="80"
      fill="hsl(var(--primary) / 0.15)"
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
    />
  </svg>
);

const BGComponent2 = () => (
  <svg
    width="340"
    height="340"
    viewBox="0 0 340 340"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0 h-full w-full"
  >
    <motion.rect
      x="50"
      y="50"
      width="240"
      height="240"
      rx="20"
      fill="hsl(var(--primary) / 0.08)"
      initial={{ rotate: 0 }}
      animate={{ rotate: 5 }}
      transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
    />
    <motion.rect
      x="80"
      y="80"
      width="180"
      height="180"
      rx="15"
      fill="hsl(var(--primary) / 0.12)"
      initial={{ rotate: 0 }}
      animate={{ rotate: -3 }}
      transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse" }}
    />
  </svg>
);

const PricingCard = ({ plan }: { plan: SubscriptionPlan }) => {
  const { user, subscription } = useAuth();

  const handleSubscribe = () => {
    if (plan.paymentMethod === 'hotmart' && plan.checkoutUrl) {
      window.open(plan.checkoutUrl, '_blank');
    } else {
      subscription.createCheckout(plan.priceId, plan.tier);
    }
  };

  const BGComponent = plan.isAnnual ? BGComponent2 : BGComponent1;

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border ${
        plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-white/20'
      }`}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 opacity-30">
        <BGComponent />
      </div>

      {plan.popular && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Mais Popular
          </div>
        </div>
      )}

      <div className="relative z-10 p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {plan.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {plan.description}
          </p>
          <div className="space-y-1">
            <div className="text-4xl font-bold text-foreground">
              {plan.price}
              <span className="text-lg text-muted-foreground">
                {plan.isAnnual ? '/ano' : '/mês'}
              </span>
            </div>
            {plan.isAnnual && (
              <div className="text-sm text-muted-foreground">
                Equivale a R$ {plan.monthlyPrice}/mês
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <motion.button
          onClick={handleSubscribe}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
            plan.popular 
              ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70' 
              : 'bg-background text-foreground border border-border hover:bg-accent'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {subscription.subscriptionStatus.subscribed ? 'Trocar Plano' : 'Assinar Agora'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export const SubscriptionPlans = () => {
  return (
    <div className="space-y-12 mb-8">
      {/* Seção Stripe - Cartão de Crédito */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            💳 Pagamento com Cartão de Crédito
          </h2>
          <p className="text-white/90">
            Acesso imediato após confirmação do pagamento
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>

      {/* Seção Hotmart - PIX */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            🔐 Pagamento com PIX
          </h2>
          <p className="text-white/90">
            Acesso liberado em até 1 hora após confirmação
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {hotmartPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
};