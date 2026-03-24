import React from 'react';
import { motion } from 'motion/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
export const FAQSection = () => {
  const faqs = [{
    question: "Como funciona a análise por foto do We Diet?",
    answer: "Nossa IA avançada analisa a foto da sua refeição e identifica automaticamente os alimentos, calcula calorias, macronutrientes e micronutrientes com alta precisão. O sistema também reconhece o método de preparo para dar informações ainda mais precisas."
  }, {
    question: "O que é o MasterCheFIT e como ele pode me ajudar?",
    answer: "O MasterCheFIT é nosso sistema de cardápios personalizados por IA. Ele cria receitas baseadas nos seus gostos, restrições alimentares e objetivos nutricionais. Inclui planejamento semanal de refeições e sugestões adaptadas ao seu perfil."
  }, {
    question: "Como funciona o ServiNUTRI?",
    answer: "O ServiNUTRI é nossa rede de nutricionistas especializados. Você pode buscar profissionais na sua região, ver suas especialidades e entrar em contato direto via WhatsApp. É uma forma prática de encontrar acompanhamento nutricional profissional."
  }, {
    question: "Posso compartilhar meus dados com meu nutricionista?",
    answer: "Sim! O app gera relatórios detalhados que podem ser enviados diretamente via WhatsApp para seu nutricionista. Isso facilita o acompanhamento e permite ajustes mais precisos na sua dieta."
  }, {
    question: "A análise nutricional é precisa?",
    answer: "Sim, nossa IA é treinada com uma vasta base de dados nutricionais e consegue identificar alimentos e métodos de preparo com alta precisão. Quanto mais você usa o app, mais ele aprende sobre suas preferências e melhora a precisão."
  }, {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem taxas adicionais. Após o cancelamento, você continuará tendo acesso aos recursos até o final do período pago."
  }, {
    question: "O app funciona offline?",
    answer: "Algumas funcionalidades básicas funcionam offline, mas para análise por foto e sincronização de dados é necessária conexão com a internet. Recomendamos usar o app conectado para aproveitar todos os recursos."
  }, {
    question: "Como defino minhas metas nutricionais?",
    answer: "No primeiro uso, o app fará algumas perguntas sobre seus objetivos (emagrecimento, ganho de massa, manutenção, etc.) e criará metas personalizadas. Você pode ajustar essas metas a qualquer momento nas configurações."
  }];
  return <section className="bg-white/30 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 my-8 px-[3px]">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.8,
      delay: 0.1,
      ease: [0.16, 1, 0.3, 1]
    }} viewport={{
      once: true
    }} className="flex flex-col items-center justify-center max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mb-8 text-center">
          Perguntas mais{' '}
          <span className="bg-gradient-to-r from-primary-500 to-pink-500 bg-clip-text text-transparent">
            Frequentes
          </span>
        </h2>
        
        <div className="w-full max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 px-6 py-2">
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-800 hover:text-primary-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 leading-relaxed pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>
      </motion.div>
    </section>;
};