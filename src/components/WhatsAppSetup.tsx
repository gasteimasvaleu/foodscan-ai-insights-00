import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageCircle, CheckCircle, XCircle } from "lucide-react";

export const WhatsAppSetup = ({ userId }: { userId: string }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    reminders: true,
    daily_summary: true,
    weekly_summary: true
  });

  const handleConnect = async () => {
    if (!phoneNumber) {
      toast.error("Digite seu número de WhatsApp");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('whatsapp_subscriptions')
        .upsert({
          user_id: userId,
          phone_number: phoneNumber,
          verified: true,
          preferences
        });

      if (error) throw error;

      toast.success("WhatsApp conectado! Envie uma mensagem para ativar.", {
        description: `Envie "oi" para +1 415 523 8886 no WhatsApp`
      });
      setIsConnected(true);
    } catch (error: any) {
      console.error('Error connecting WhatsApp:', error);
      toast.error("Erro ao conectar WhatsApp", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('whatsapp_subscriptions')
        .update({ preferences })
        .eq('user_id', userId)
        .eq('phone_number', phoneNumber);

      if (error) throw error;

      toast.success("Preferências atualizadas!");
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast.error("Erro ao atualizar preferências");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-green-600" />
          <CardTitle>Conectar WhatsApp</CardTitle>
        </div>
        <CardDescription>
          Receba análises de fotos e lembretes diretamente no WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Número do WhatsApp (com DDD)</Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                type="tel"
                placeholder="+5511999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isConnected}
              />
              {isConnected ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <XCircle className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
          </div>

          {!isConnected && (
            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Conectando..." : "Conectar WhatsApp"}
            </Button>
          )}

          {isConnected && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Preferências de Notificação</h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reminders" className="cursor-pointer">
                  Lembretes de refeições
                </Label>
                <Switch
                  id="reminders"
                  checked={preferences.reminders}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, reminders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="daily" className="cursor-pointer">
                  Resumo diário
                </Label>
                <Switch
                  id="daily"
                  checked={preferences.daily_summary}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, daily_summary: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="weekly" className="cursor-pointer">
                  Resumo semanal
                </Label>
                <Switch
                  id="weekly"
                  checked={preferences.weekly_summary}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, weekly_summary: checked })
                  }
                />
              </div>

              <Button 
                onClick={handleUpdatePreferences} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? "Salvando..." : "Salvar Preferências"}
              </Button>
            </div>
          )}
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
          <h4 className="font-medium">📱 Como usar:</h4>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Conecte seu número acima</li>
            <li>Envie "oi" para +1 415 523 8886 no WhatsApp</li>
            <li>Envie fotos de comida para análise automática</li>
            <li>Use comandos como "resumo", "meta", "semanal"</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};