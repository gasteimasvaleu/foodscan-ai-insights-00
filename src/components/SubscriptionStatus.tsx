import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Settings, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const SubscriptionStatus = () => {
  const { user, subscription } = useAuth();

  if (!user) {
    return null;
  }

  const { subscriptionStatus, loading, checkSubscription, openCustomerPortal } = subscription;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 mb-8">
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p>Verificando status da assinatura...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-white/20 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Status da Assinatura</h3>
          <Button
            onClick={checkSubscription}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className={`w-5 h-5 ${subscriptionStatus.subscribed ? 'text-success-500' : 'text-gray-400'}`} />
            <span className="text-gray-700">Status:</span>
            <Badge variant={subscriptionStatus.subscribed ? 'default' : 'secondary'}>
              {subscriptionStatus.subscribed ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {subscriptionStatus.subscription_tier && (
            <div className="flex items-center gap-3">
              <span className="text-gray-700">Plano:</span>
              <Badge variant="outline">{subscriptionStatus.subscription_tier}</Badge>
            </div>
          )}

          {subscriptionStatus.subscription_end && (
            <div className="flex items-center gap-3">
              <span className="text-gray-700">Renovação:</span>
              <span className="text-gray-600">{formatDate(subscriptionStatus.subscription_end)}</span>
            </div>
          )}

          {subscriptionStatus.subscribed && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => window.open('https://hotmart.com.br', '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Gerenciar Assinatura
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};