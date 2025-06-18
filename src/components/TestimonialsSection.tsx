
import React from 'react';
import { motion } from 'motion/react';
import { TestimonialsColumn } from '@/components/ui/testimonials-columns-1';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      text: "Incrível como a IA identifica até temperos! Meus pacientes adoram a praticidade e eu confio nos dados nutricionais. Revolucionou minha prática!",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      name: "Ana Carolina",
      role: "Nutricionista",
    },
    {
      text: "O MasterCheFIT é genial! Crio dietas personalizadas em segundos. Meus alunos ficam impressionados com as receitas. Economizo 3h por dia!",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      name: "Roberto Silva",
      role: "Personal Trainer",
    },
    {
      text: "Finalmente consegui controlar minha alimentação! O feedback diário me motiva e as receitas são deliciosas. Perdi 8kg em 3 meses!",
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      name: "Marina Santos",
      role: "Mãe de 2 filhos",
    },
    {
      text: "A análise por foto é impressionante! Identifica tudo que como e me ajuda a manter o foco nas minhas metas de emagrecimento.",
      image: "https://randomuser.me/api/portraits/men/4.jpg",
      name: "Carlos Eduardo",
      role: "Engenheiro",
    },
    {
      text: "Como profissional da saúde, recomendo o app para todos os meus pacientes. A precisão dos dados nutricionais é fantástica!",
      image: "https://randomuser.me/api/portraits/women/5.jpg",
      name: "Dr. Fernanda Lima",
      role: "Endocrinologista",
    },
    {
      text: "O app me ajudou a criar uma rotina alimentar saudável. As receitas do MasterCheFIT são práticas e deliciosas para toda família.",
      image: "https://randomuser.me/api/portraits/women/6.jpg",
      name: "Juliana Mendes",
      role: "Empresária",
    },
    {
      text: "Uso o FoodScan diariamente com meus atletas. A funcionalidade de análise de macros é perfeita para otimizar a performance.",
      image: "https://randomuser.me/api/portraits/men/7.jpg",
      name: "Lucas Trainer",
      role: "Preparador Físico",
    },
    {
      text: "Nunca pensei que controlar a alimentação pudesse ser tão fácil! O feedback do app me mantém motivada todos os dias.",
      image: "https://randomuser.me/api/portraits/women/8.jpg",
      name: "Beatriz Costa",
      role: "Estudante",
    },
    {
      text: "O app transformou minha relação com a comida. Agora sei exatamente o que estou consumindo e consigo bater minhas metas fitness.",
      image: "https://randomuser.me/api/portraits/men/9.jpg",
      name: "Rafael Oliveira",
      role: "Personal Trainer",
    },
  ];

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 9);

  return (
    <section className="bg-background my-20 relative">
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-lg bg-gradient-to-r from-primary-500/10 to-purple-600/10 text-primary-700 font-medium">
              Depoimentos
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-center">
            O que nossos usuários{' '}
            <span className="bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
              estão dizendo
            </span>
          </h2>
          <p className="text-center mt-5 opacity-75 text-gray-600">
            Veja o que nossos usuários têm a dizer sobre o FoodScan & Diet.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};
