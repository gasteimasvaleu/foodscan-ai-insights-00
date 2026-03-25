import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-primary pb-28">
      <Navbar />
      <div className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#FD46A1]">Política de Privacidade</h1>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
