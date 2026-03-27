import React, { useState } from 'react';
import { Heart, Activity, Watch, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface HealthKitConnectProps {
  onConnect: () => Promise<boolean>;
  onDismiss: () => void;
  isLoading: boolean;
  debugStatus?: string;
}

export const HealthKitConnect: React.FC<HealthKitConnectProps> = ({
  onConnect,
  onDismiss,
  isLoading,
  debugStatus,
}) => {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    console.log('[HealthKitConnect] Button tapped – starting connection flow');
    setConnecting(true);
    try {
      // Wrap onConnect with a 20s timeout so the button never gets stuck
      const timeoutPromise = new Promise<boolean>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout (20s)')), 20000)
      );
      const success = await Promise.race([onConnect(), timeoutPromise]);
      console.log('[HealthKitConnect] onConnect resolved, success:', success);
      if (success) {
        toast({
          title: '✅ Apple Health conectado!',
          description: 'Seus dados de saúde serão sincronizados automaticamente.',
        });
      } else {
        toast({
          title: 'Não foi possível conectar',
          description: 'Verifique se o Apple Health está habilitado nas configurações do seu iPhone.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('[HealthKitConnect] onConnect error:', err);
      toast({
        title: 'Erro ao conectar',
        description: err instanceof Error ? err.message : 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="mb-6 animate-fade-in">
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 shadow-lg">
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-red-500 to-pink-500 p-2.5 rounded-xl shadow-md">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Apple Health</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Sincronize automaticamente seus dados de saúde para uma experiência completa.
        </p>

        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <Activity className="w-4 h-4 text-primary" />
            <span>Passos e calorias queimadas</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <Watch className="w-4 h-4 text-primary" />
            <span>Dados do Apple Watch, Garmin e Strava</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/80">
            <Heart className="w-4 h-4 text-primary" />
            <span>Refeições salvas no Apple Health</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleConnect}
            disabled={connecting || isLoading}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-md"
          >
            {connecting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Conectando...
              </div>
            ) : debugStatus && debugStatus !== 'idle' ? (
              <span className="text-xs">{debugStatus}</span>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" fill="white" />
                Conectar Apple Health
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onDismiss}
            className="text-muted-foreground rounded-xl"
          >
            Agora não
          </Button>
        </div>
      </div>
    </div>
  );
};
