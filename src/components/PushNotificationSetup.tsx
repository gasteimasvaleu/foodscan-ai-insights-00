import { useEffect, useImperativeHandle, forwardRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PushNotificationSetupRef {
  setupPushNotifications: () => Promise<void>;
}

export const PushNotificationSetup = forwardRef<PushNotificationSetupRef>((_, ref) => {
  const { user } = useAuth();

  const setupPushNotifications = async () => {
    // Só configurar se o usuário estiver logado
    if (!user) {
      console.log('User not logged in, skipping push notification setup');
      return;
    }

    try {
      console.log('Setting up push notifications for user:', user.id);
      
      // Verificar se o browser suporta notificações
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported by browser');
        return;
      }

      // Verificar se a permissão já foi concedida
      if (Notification.permission !== 'granted') {
        console.log('Notification permission not granted:', Notification.permission);
        return;
      }

      console.log('Notification permission granted, proceeding with setup');

      // Aguardar o Service Worker estar pronto
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker ready');

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

        console.log('VAPID public key retrieved, creating subscription...');

        // Criar nova subscription
        const vapidPublicKey = vapidData.publicKey;
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });

        console.log('New subscription created');
      } else {
        console.log('Using existing subscription');
      }

      // Registrar a subscription no backend
      console.log('Registering subscription with backend...');
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

  // Verificar automaticamente se já tem permissão ao carregar o componente
  useEffect(() => {
    if (user && Notification.permission === 'granted') {
      console.log('User has permission, setting up notifications automatically');
      setupPushNotifications();
    }
  }, [user]);

  useImperativeHandle(ref, () => ({
    setupPushNotifications
  }));

  // Este componente não renderiza nada - apenas configura as notificações
  return null;
});