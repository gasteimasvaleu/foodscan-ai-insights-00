import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gradient-primary pb-28">
      <Navbar />
      <div className="pt-[calc(env(safe-area-inset-top)+4rem)] pb-12 px-2">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#FD46A1]">Termos de Uso</h1>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
