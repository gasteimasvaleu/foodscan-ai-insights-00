import React from 'react';

const STRIPE_LINKS = {
  monthly: 'https://buy.stripe.com/bJebJ15tm6TEd5g1314Rq05',
  semester: 'https://buy.stripe.com/5kQ5kDg806TE0iuh1Z4Rq04',
  annual: 'https://buy.stripe.com/bJebJ18Fydi2c1cfXV4Rq06'
};

export const Component = () => {
  return (
    <section className="bg-transparent px-2 sm:px-4 transition-colors py-0">
      <div className="mx-auto flex w-full justify-center items-center">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-fit">
          <PricingCard 
            label="Assinatura Mensal" 
            monthlyPrice="27,90" 
            description="Transforme sua alimentação com tecnologia de ponta e análise nutricional inteligente" 
            cta="Assinar Agora" 
            background="bg-primary-600 dark:bg-primary-700" 
            stripeLink={STRIPE_LINKS.monthly}
          />
          <PricingCard 
            label="Assinatura Semestral" 
            monthlyPrice="149,90" 
            description="6 meses de análise nutricional inteligente com economia e praticidade" 
            cta="Assinar Agora" 
            background="bg-purple-600 dark:bg-purple-700" 
            stripeLink={STRIPE_LINKS.semester}
            isSemester={true}
          />
          <PricingCard 
            label="Assinatura Anual" 
            monthlyPrice="277,90" 
            description="1 ano completo de transformação alimentar com o melhor custo-benefício" 
            cta="Assinar Agora" 
            background="bg-green-600 dark:bg-green-700" 
            stripeLink={STRIPE_LINKS.annual}
            isAnnual={true}
          />
        </div>
      </div>
    </section>
  );
};

const PricingCard = ({
  label,
  monthlyPrice,
  description,
  cta,
  background,
  stripeLink,
  isAnnual = false,
  isSemester = false
}: {
  label: string;
  monthlyPrice: string;
  description: string;
  cta: string;
  background: string;
  stripeLink: string;
  isAnnual?: boolean;
  isSemester?: boolean;
}) => {
  const handleSubscribe = () => {
    window.open(stripeLink, '_blank');
  };

  return (
    <div className={`relative h-80 w-72 sm:h-96 sm:w-80 shrink-0 overflow-hidden rounded-xl p-4 sm:p-8 ${background} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="relative z-10 text-white">
        <span className="mb-2 sm:mb-3 block w-fit rounded-full bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-0.5 text-xs sm:text-sm font-medium text-white border border-white/20">
          {label}
        </span>
        <span className="my-1 sm:my-2 block origin-top-left font-mono text-4xl sm:text-6xl font-black leading-[1.2]">
          R${monthlyPrice}/<br />{isAnnual ? 'Ano' : isSemester ? 'Semestral' : 'Mês'}
        </span>
        <p className="text-sm sm:text-lg text-white/90">{description}</p>
      </div>
      <button 
        onClick={handleSubscribe}
        className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-20 rounded-lg border-2 border-white bg-white py-1.5 sm:py-2 text-center font-mono text-xs sm:text-sm font-black uppercase text-neutral-800 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white hover:border-white/80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
      >
        {cta}
      </button>
    </div>
  );
};