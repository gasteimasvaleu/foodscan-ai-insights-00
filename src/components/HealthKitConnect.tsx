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

const WATCHDOG_MS = 25000; // 25s safety net

export const HealthKitConnect: React.FC<HealthKitConnectProps> = ({
  onConnect,
  onDismiss,
  isLoading,
  debugStatus,
}) => {
  const [connecting, setConnecting] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  const handleConnect = async () => {
    console.log('[HealthKitConnect] Button tapped – starting connection flow');
    setConnecting(true);
    setLocalStatus('iniciando...');

    try {
      // Watchdog: if onConnect never resolves, force-fail after WATCHDOG_MS
      const result = await Promise.race([
        onConnect(),
        new Promise<'timeout'>((resolve) =>
          setTimeout(() => resolve('timeout'), WATCHDOG_MS)
        ),
      ]);

      if (result === 'timeout') {
        console.error('[HealthKitConnect] Watchdog timeout after', WATCHDOG_MS / 1000, 's');
        setLocalStatus('Timeout – o plugin nativo não respondeu');
        toast({
          title: 'Timeout na conexão',
          description: `O Apple Health não respondeu em ${WATCHDOG_MS / 1000}s. Tente novamente ou reinicie o app.`,
          variant: 'destructive',
        });
        return;
      }

      console.log('[HealthKitConnect] onConnect resolved, success:', result);
      if (result) {
        setLocalStatus(null);
        toast({
          title: '✅ Apple Health conectado!',
          description: 'Seus dados de saúde serão sincronizados automaticamente.',
        });
      } else {
        setLocalStatus('falha na conexão');
        toast({
          title: 'Não foi possível conectar',
          description: 'Verifique se o Apple Health está habilitado nas configurações do seu iPhone.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('[HealthKitConnect] onConnect error:', err?.message || String(err));
      const errorMsg = err?.message || String(err) || 'Erro desconhecido';
      setLocalStatus(`erro: ${errorMsg}`);
      toast({
        title: 'Erro ao conectar',
        description: errorMsg,
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

        {/* Debug status visible on screen */}
        {displayStatus && (
          <div className="mb-3 p-2 bg-muted/50 rounded-lg">
            <p className="text-xs font-mono text-muted-foreground">{displayStatus}</p>
          </div>
        )}

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
