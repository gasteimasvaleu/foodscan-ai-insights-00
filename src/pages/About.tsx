import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, Mail } from 'lucide-react';
const About = () => {
  return <div className="min-h-screen bg-gradient-primary pb-28">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Sobre
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">Conheça mais sobre o We Diet</p>
          </div>

          <div className="space-y-8">
            {/* Política de Privacidade */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-primary-600">
                  <div className="bg-primary-100 rounded-full p-2">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                  Política de Privacidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 text-gray-700">
                  <h3 className="text-lg font-semibold text-primary-600">Coleta de Informações</h3>
                  <p>
                    Coletamos informações que você nos fornece diretamente ao usar nosso aplicativo, incluindo dados de registro, 
                    fotos de alimentos e informações nutricionais. Também coletamos dados de uso para melhorar nossos serviços.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-primary-600">Uso das Informações</h3>
                  <p>
                    Utilizamos suas informações para fornecer análises nutricionais personalizadas, melhorar nossos algoritmos de IA 
                    e oferecer suporte ao cliente. Seus dados não são compartilhados com terceiros sem seu consentimento.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-primary-600">Segurança dos Dados</h3>
                  <p>
                    Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra 
                    acesso não autorizado, alteração, divulgação ou destruição.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Termos de Uso */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-primary-600">
                  <div className="bg-primary-100 rounded-full p-2">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  Termos de Uso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 text-gray-700">
                  <h3 className="text-lg font-semibold text-primary-600">Aceitação dos Termos</h3>
                  <p>Ao usar o We Diet, você concorda em cumprir estes termos de uso. Se você não concordar com qualquer parte destes termos, não use nosso serviço.</p>
                  
                  <h3 className="text-lg font-semibold text-primary-600">Uso Permitido</h3>
                  <p>
                    Você pode usar nosso aplicativo para fins pessoais e não comerciais. É proibido usar o serviço para 
                    atividades ilegais ou que violem os direitos de terceiros.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-primary-600">Limitação de Responsabilidade</h3>
                  <p>
                    As informações nutricionais fornecidas são estimativas baseadas em análise de IA. Consulte sempre um 
                    profissional de saúde qualificado para orientação médica ou nutricional específica.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-primary-600">Assinatura e Pagamento</h3>
                  <p>
                    O acesso completo ao We Diet requer uma assinatura mensal. Os pagamentos são processados de forma segura 
                    e você pode cancelar sua assinatura a qualquer momento.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-primary-600">
                  <div className="bg-primary-100 rounded-full p-2">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 text-gray-700">
                  <h3 className="text-lg font-semibold text-primary-600">Suporte ao Cliente</h3>
                  <p>
                    Nossa equipe de suporte está disponível para ajudá-lo com qualquer dúvida ou problema que você possa ter 
                    ao usar o We Diet.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-primary-600 mb-2">Email</h4>
                      <p className="text-gray-600">foodscanEdiet@hotmail.com</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-primary-600 mb-2">WhatsApp</h4>
                      <p className="text-gray-600">+55 (83) 999187322</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-primary-600 mt-6">Horário de Atendimento</h3>
                  <p>
                    Segunda a Sexta: 9h às 18h<br />
                    Sábado: 9h às 14h<br />
                    Domingo: Fechado
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default About;