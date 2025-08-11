import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Download, X, Loader2 } from 'lucide-react';
import { usePWAUpdates } from '@/hooks/usePWAUpdates';

const PWAUpdateNotification = () => {
  const { hasUpdate, isUpdating, updateError, applyUpdate, dismissUpdate } = usePWAUpdates();

  if (!hasUpdate || isUpdating) return null;

  return (
    <Alert className="fixed top-4 left-4 right-4 z-50 border-blue-200 bg-blue-50 shadow-lg animate-slide-down safe-area-top">
      <Download className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800 flex items-center justify-between w-full">
        <div className="flex-1 pr-4">
          <div className="font-medium">Nova versão disponível!</div>
          <div className="text-sm opacity-90">
            Atualize para acessar as últimas funcionalidades e melhorias.
          </div>
          {updateError && (
            <div className="text-red-600 text-sm mt-1">
              {updateError}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            onClick={applyUpdate}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Atualizando...
              </>
            ) : (
              'Atualizar'
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={dismissUpdate}
            disabled={isUpdating}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default PWAUpdateNotification;