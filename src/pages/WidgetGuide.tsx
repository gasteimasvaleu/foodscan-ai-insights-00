import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Plus, LayoutGrid, Flame, Droplets, Apple } from 'lucide-react';

const steps = [
  {
    icon: Smartphone,
    title: 'Toque e segure',
    description: 'Na tela inicial do iPhone, toque e segure em uma área vazia até os ícones começarem a tremer.',
  },
  {
    icon: Plus,
    title: 'Adicionar Widget',
    description: 'Toque no botão "+" no canto superior esquerdo e busque por "WeDiet" ou "Dieta Inteligente".',
  },
  {
    icon: LayoutGrid,
    title: 'Escolha o tamanho',
    description: 'Selecione o tamanho do widget (pequeno, médio ou grande) e toque em "Adicionar Widget".',
  },
];

export default function WidgetGuide() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-32">
        <div className="max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)] space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Widget iOS</h1>
          </div>

          <p className="text-muted-foreground text-sm">
            Acompanhe suas calorias, macros e hidratação direto na tela inicial do seu iPhone — sem precisar abrir o app!
          </p>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border-border/50 shadow-md">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 shrink-0">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </span>
                      <h3 className="font-semibold text-base">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Preview Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/15 border-primary/20 shadow-lg">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-center text-lg">O que o Widget mostra</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background/80 rounded-xl p-3 text-center">
                  <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xs font-medium text-muted-foreground">Calorias</p>
                  <p className="text-sm font-bold">restantes</p>
                </div>
                <div className="bg-background/80 rounded-xl p-3 text-center">
                  <Apple className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xs font-medium text-muted-foreground">Macros</p>
                  <p className="text-sm font-bold">C / P / G</p>
                </div>
                <div className="bg-background/80 rounded-xl p-3 text-center">
                  <Droplets className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xs font-medium text-muted-foreground">Hidratação</p>
                  <p className="text-sm font-bold">progresso</p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Atualizado automaticamente conforme você registra no app.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
