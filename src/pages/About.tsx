import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, Mail } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-primary">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Sobre
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Conheça mais sobre o FoodScan&Diet
            </p>
          </div>

          <div className="space-y-8">
            {/* Política de Privacidade */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-primary-500/20 rounded-lg">
                    <Shield className="h-6 w-6 text-primary-300" />
                  </div>
                  Política de Privacidade
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white/90 space-y-4">
                <p>
                  O FoodScan&Diet está comprometido com a proteção da sua privacidade. 
                  Coletamos apenas as informações necessárias para fornecer nossos serviços 
                  de análise nutricional e acompanhamento dietético.
                </p>
                <p>
                  Seus dados pessoais são tratados com máxima segurança e não são 
                  compartilhados com terceiros sem seu consentimento expresso.
                </p>
                <p>
                  Para mais informações detalhadas sobre como tratamos seus dados, 
                  entre em contato conosco através dos canais disponíveis.
                </p>
              </CardContent>
            </Card>

            {/* Termos de Uso */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-primary-500/20 rounded-lg">
                    <FileText className="h-6 w-6 text-primary-300" />
                  </div>
                  Termos de Uso
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white/90 space-y-4">
                <p>
                  Ao utilizar o FoodScan&Diet, você concorda com nossos termos de uso. 
                  Nosso aplicativo é destinado a fins informativos e educacionais sobre 
                  nutrição e alimentação saudável.
                </p>
                <p>
                  As informações fornecidas não substituem o acompanhamento profissional 
                  de um nutricionista ou médico. Sempre consulte um profissional de saúde 
                  antes de fazer mudanças significativas em sua dieta.
                </p>
                <p>
                  É proibido o uso do aplicativo para fins comerciais sem autorização 
                  prévia. Todos os direitos são reservados.
                </p>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-primary-500/20 rounded-lg">
                    <Mail className="h-6 w-6 text-primary-300" />
                  </div>
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white/90 space-y-4">
                <div className="space-y-2">
                  <p className="font-medium">📧 Email:</p>
                  <p className="text-gray-300">direitaquevence@hotmail.com</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">📱 WhatsApp:</p>
                  <p className="text-gray-300">(11) 99999-9999</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">🕒 Horário de Atendimento:</p>
                  <p className="text-gray-300">Segunda a Sexta: 08:00 às 18:00</p>
                  <p className="text-gray-300">Sábado: 08:00 às 12:00</p>
                </div>
                <div className="mt-6 p-4 bg-primary-500/10 rounded-lg border border-primary-300/30">
                  <p className="text-sm text-primary-200">
                    💡 <strong>Dica:</strong> Para um atendimento mais rápido, 
                    entre em contato via WhatsApp durante nosso horário comercial.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;