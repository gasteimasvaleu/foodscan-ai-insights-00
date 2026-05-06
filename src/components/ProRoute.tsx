import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNativePlatform } from '@/hooks/useNativePlatform';
import { FREEMIUM_ENABLED } from '@/config/freemium';

interface ProRouteProps {
  children: React.ReactNode;
  /** Slug da feature, usado na query string ?feature= para mensagem contextual no paywall. */
  feature?: string;
}

/**
 * Wrapper que redireciona usuários free (iOS nativo) para `/assinar`.
 * Salvaguarda: se subscribed=true, web/android, ou flag desligada, libera.
 */
export const ProRoute: React.FC<ProRouteProps> = ({ children, feature }) => {
  const { user, authReady, subscriptionReady, subscriptionStatus } = useAuth();
  const { isNative, isIOS } = useNativePlatform();
  const location = useLocation();

  // Aguarda auth/subscription antes de decidir
  if (!authReady) return <>{children}</>;
  if (!user) return <>{children}</>;

  // Flag desligada → tudo liberado
  if (!FREEMIUM_ENABLED) return <>{children}</>;

  // Apenas gateia em iOS nativo
  if (!isNative || !isIOS) return <>{children}</>;

  // Espera o check de subscription
  if (!subscriptionReady) return <>{children}</>;

  // Assinante → libera
  if (subscriptionStatus.subscribed) return <>{children}</>;

  const params = new URLSearchParams({
    reason: 'feature_locked',
    ...(feature ? { feature } : {}),
    from: location.pathname,
  });
  return <Navigate to={`/assinar?${params.toString()}`} replace />;
};

export default ProRoute;
