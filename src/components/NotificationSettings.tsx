import { useState, useEffect, useRef } from "react";
import { Bell, BellOff, AlertCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { PushNotificationSetup, PushNotificationSetupRef } from "@/components/PushNotificationSetup";
import { supabase } from "@/integrations/supabase/client";

export function NotificationSettings() {
  const { user } = useAuth();
  const [notificationStatus, setNotificationStatus] = useState<"granted" | "denied" | "default" | "unsupported">("default");
  const [loading, setLoading] = useState(false);
  const pushNotificationRef = useRef<PushNotificationSetupRef>(null);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = () => {
    if (!("Notification" in window)) {
      setNotificationStatus("unsupported");
      return;
    }

    setNotificationStatus(Notification.permission);
  };

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para ativar notificações.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Solicitar permissão ao usuário
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);

      if (permission === "granted") {
        console.log("✅ Permissão concedida, iniciando setup...");
        
        // Chamar o setup para registrar no banco
        const result = await pushNotificationRef.current?.setupPushNotifications();
        
        console.log("📋 Resultado do setup:", result);
        
        if (result?.success) {
          toast({
            title: "Notificações ativadas! 🔔",
            description: "Você receberá notificações sobre novidades e lembretes.",
          });
        } else {
          toast({
            title: "Erro ao ativar notificações",
            description: result?.error || "Não foi possível registrar a notificação. Tente novamente.",
            variant: "destructive",
          });
        }
      } else if (permission === "denied") {
        toast({
          title: "Permissão negada",
          description: "Você bloqueou as notificações. Para ativar, altere as configurações do seu navegador.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Erro ao ativar notificações:", error);
      toast({
        title: "Erro ao ativar notificações",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveNotifications = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Remover subscription do navegador
      if ("serviceWorker" in navigator && "PushManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          console.log("✅ Subscription removida do navegador");
        }
      }

      // 2. Deletar registros do banco
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error("Erro ao deletar subscriptions do banco:", error);
      } else {
        console.log("✅ Subscriptions removidas do banco");
      }

      // 3. Resetar o status
      checkNotificationStatus();

      toast({
        title: "Notificações removidas! 🗑️",
        description: "Você pode agora configurar as notificações novamente.",
      });
    } catch (error) {
      console.error("❌ Erro ao remover notificações:", error);
      toast({
        title: "Erro ao remover notificações",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (notificationStatus) {
      case "granted":
        return <Bell className="h-6 w-6 text-green-500" />;
      case "denied":
        return <BellOff className="h-6 w-6 text-destructive" />;
      case "unsupported":
        return <AlertCircle className="h-6 w-6 text-muted-foreground" />;
      default:
        return <Bell className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (notificationStatus) {
      case "granted":
        return { title: "Notificações Ativadas", description: "Você está recebendo notificações push" };
      case "denied":
        return { title: "Notificações Bloqueadas", description: "Altere as configurações do navegador para ativar" };
      case "unsupported":
        return { title: "Não Suportado", description: "Seu navegador não suporta notificações push" };
      default:
        return { title: "Notificações Desativadas", description: "Ative para receber novidades e lembretes" };
    }
  };

  const statusInfo = getStatusText();

  return (
    <>
      <PushNotificationSetup ref={pushNotificationRef} />
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Notificações Push
          </CardTitle>
          <CardDescription>
            Receba notificações sobre novidades, lembretes e atualizações importantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">{statusInfo.title}</p>
              <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
            </div>
          </div>

          {notificationStatus === "default" && (
            <Button 
              onClick={handleEnableNotifications} 
              disabled={loading}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              {loading ? "Ativando..." : "Ativar Notificações"}
            </Button>
          )}

          {notificationStatus === "denied" && (
            <div className="text-sm text-muted-foreground bg-destructive/10 p-3 rounded-md">
              <p className="font-medium mb-1">Como ativar:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Clique no ícone de cadeado/configurações na barra de endereço</li>
                <li>Encontre a opção "Notificações"</li>
                <li>Altere para "Permitir"</li>
                <li>Recarregue a página</li>
              </ol>
            </div>
          )}

          {notificationStatus === "granted" && (
            <>
              <div className="text-sm text-muted-foreground bg-green-500/10 p-3 rounded-md">
                <p>✅ Suas notificações estão configuradas e ativas!</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleEnableNotifications} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {loading ? "Verificando..." : "Verificar/Reativar Notificações"}
                </Button>
                <Button 
                  onClick={handleRemoveNotifications} 
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {loading ? "Removendo..." : "Remover Notificações"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
