import { useEffect, useImperativeHandle, forwardRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PushNotificationSetupRef {
  setupPushNotifications: () => Promise<void>;
}

export const PushNotificationSetup = forwardRef<PushNotificationSetupRef>((_, ref) => {
  const { user } = useAuth();

  const setupPushNotifications = async () => {
    // Verificar ambiente antes de qualquer coisa
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      console.log('❌ Notification API não disponível neste ambiente');
      return;
    }

    // Verificar se o usuário estiver logado
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      console.log('❌ Usuário não autenticado');
      return;
    }

    try {
      console.log('🔧 Setting up push notifications for user:', currentUser.id);
      console.log('📊 Current notification permission:', Notification.permission);
      
      // Verificar se o browser suporta notificações
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('❌ Push notifications not supported by browser');
        return;
      }

      // Verificar se a permissão já foi concedida
      if (Notification.permission !== 'granted') {
        console.log('⚠️ Notification permission not granted:', Notification.permission);
        return;
      }

      console.log('✅ Notification permission granted, proceeding with setup');

      // Verificar se Service Worker existe
      console.log('🔍 Checking service worker...');
      if (!navigator.serviceWorker) {
        console.log('❌ Service Worker not available');
        return;
      }

      // Aguardar o Service Worker estar pronto
      console.log('⏳ Waiting for Service Worker to be ready...');
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready:', registration);

      // Verificar se já tem uma subscription ativa
      console.log('🔍 Checking for existing subscription...');
      let subscription = await registration.pushManager.getSubscription();
      console.log('📋 Existing subscription:', subscription ? 'Found' : 'None');

      if (!subscription) {
        console.log('🔑 No existing subscription, creating new one...');
        
        // Buscar a VAPID public key do backend
        console.log('🔑 Fetching VAPID public key...');
        const { data: vapidData, error: vapidError } = await supabase.functions.invoke('get-vapid-public-key');
        
        if (vapidError) {
          console.error('❌ Error getting VAPID public key:', vapidError);
          return;
        }

        if (!vapidData?.publicKey) {
          console.error('❌ No VAPID public key in response:', vapidData);
          return;
        }

        console.log('✅ VAPID public key retrieved successfully');
        console.log('🔑 VAPID key length:', vapidData.publicKey.length);

        // Criar nova subscription
        const vapidPublicKey = vapidData.publicKey;
        
        console.log('📱 Creating push subscription...');
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });

        console.log('✅ New subscription created successfully');
        console.log('📋 Subscription endpoint:', subscription.endpoint);
      } else {
        console.log('♻️ Using existing subscription');
        console.log('📋 Existing endpoint:', subscription.endpoint);
      }

      // Registrar a subscription no backend
      console.log('💾 Registering subscription with backend...');
      
      // Verificar se temos uma sessão ativa
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('❌ No active session for registration:', sessionError);
        return;
      }
      
      console.log('✅ Active session found for user:', session.user.id);
      console.log('📤 Subscription data being sent:', {
        endpoint: subscription.endpoint,
        keys: subscription.getKey ? {
          p256dh: subscription.getKey('p256dh'),
          auth: subscription.getKey('auth')
        } : 'Keys not available'
      });

      const { data: registerData, error: registerError } = await supabase.functions.invoke('register-push-subscription', {
        body: { subscription }
      });

      if (registerError) {
        console.error('❌ Error registering push subscription:', registerError);
        console.error('❌ Error details:', registerError.message);
      } else {
        console.log('🎉 Push subscription registered successfully!');
        console.log('📋 Registration response:', registerData);
      }

    } catch (error) {
      console.error('💥 Error setting up push notifications:', error);
      console.error('💥 Error stack:', error.stack);
    }
  };

  // Verificar automaticamente se já tem permissão ao carregar o componente
  useEffect(() => {
    if (!user) return;
    
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      console.log('❌ Notification API não disponível, pulando auto-setup');
      return;
    }

    if (Notification.permission === 'granted') {
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