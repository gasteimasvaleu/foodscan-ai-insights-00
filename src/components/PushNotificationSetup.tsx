import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const PushNotificationSetup = () => {
  const { user } = useAuth();

  useEffect(() => {
    const setupPushNotifications = async () => {
      // Só configurar se o usuário estiver logado
      if (!user) return;

      try {
        // Verificar se o browser suporta notificações
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          console.log('Push notifications not supported');
          return;
        }

        // Aguardar o Service Worker estar pronto
        const registration = await navigator.serviceWorker.ready;

        // Verificar se já tem uma subscription ativa
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          console.log('No existing subscription, creating new one...');
          
          // Buscar a VAPID public key do backend
          const { data: vapidData, error: vapidError } = await supabase.functions.invoke('get-vapid-public-key');
          
          if (vapidError || !vapidData?.publicKey) {
            console.error('Error getting VAPID public key:', vapidError);
            return;
          }

          // Criar nova subscription
          const vapidPublicKey = vapidData.publicKey;
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidPublicKey
          });
        }

        // Registrar a subscription no backend
        const { error } = await supabase.functions.invoke('register-push-subscription', {
          body: { subscription }
        });

        if (error) {
          console.error('Error registering push subscription:', error);
        } else {
          console.log('Push subscription registered successfully');
        }

      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    };

    setupPushNotifications();
  }, [user]);

  // Este componente não renderiza nada - apenas configura as notificações
  return null;
};