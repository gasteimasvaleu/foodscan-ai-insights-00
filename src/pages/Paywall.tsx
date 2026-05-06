import { useNavigate, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import PaywallScreen from '@/components/PaywallScreen';
import { useAuth } from '@/hooks/useAuth';

const REASON_MESSAGES: Record<string, string> = {
  feature_locked: 'Este recurso é exclusivo do We Diet Pro.',
  quota_exceeded: 'Você atingiu o limite gratuito de hoje. Assine o Pro para uso ilimitado.',
};

const FEATURE_LABELS: Record<string, string> = {
  'fit-tracker': 'Registro de exercícios',
  masterchef: 'Cardápio com IA',
  treinos: 'Treinos em vídeo',
  'nutri-coach': 'NutriCoach (IA)',
  receitas: 'Minhas receitas',
  'faca-em-casa': 'Faça em Casa',
  provador: 'Provador Inteligente',
  jejum: 'Jejum intermitente',
  sono: 'Sono',
  'apple-health': 'Apple Health',
  'profile-diets': 'Minhas dietas',
  'whatsapp-settings': 'WhatsApp',
  'graficos-progresso': 'Gráficos de progresso',
  objetivos: 'Objetivos semanais',
  hidratacao: 'Hidratação',
  foodscan: 'FoodScan ilimitado',
};

const Paywall = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, checkSubscription } = useAuth();

  const reason = searchParams.get('reason') || '';
  const feature = searchParams.get('feature') || '';

  const reasonMessage = REASON_MESSAGES[reason];
  const featureLabel = FEATURE_LABELS[feature];

  const handleClose = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header com botão X */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-[calc(env(safe-area-inset-top)+0.5rem)] px-4 pb-2 flex justify-end">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar"
          className="w-10 h-10 rounded-full bg-[#FD46A1] text-white flex items-center justify-center shadow-lg active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <PaywallScreen
        contextBadge={
          reasonMessage || featureLabel ? (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl px-4 py-2.5 text-center shadow-sm border border-white/40">
              {featureLabel && (
                <p className="text-[11px] text-muted-foreground mb-0.5">{featureLabel}</p>
              )}
              <p className="text-xs font-medium text-gray-800 leading-snug">
                {reasonMessage || 'Desbloqueie todos os recursos com o Pro.'}
              </p>
            </div>
          ) : null
        }
        user={{ id: user?.id || '', email: user?.email }}
        onSubscribed={async () => {
          await checkSubscription();
          navigate('/');
        }}
      />
    </div>
  );
};

export default Paywall;
