import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageCircle, CheckCircle, XCircle, Bell, Moon, Target, Sparkles } from "lucide-react";

const PREF_ITEMS = [
  { key: "reminders", label: "Lembretes agendados", desc: "Refeições, sono, exercício, etc.", icon: Bell },
  { key: "fasting_notification", label: "Alerta de jejum completo", desc: "Aviso quando a meta de jejum é atingida", icon: Moon },
  { key: "weekly_objectives", label: "Resumo semanal de objetivos", desc: "Enviado aos domingos às 22h", icon: Target },
  { key: "motivational", label: "Mensagem motivacional diária", desc: "Enviada às 6h com IA", icon: Sparkles },
] as const;

type PrefKey = typeof PREF_ITEMS[number]["key"];

export const WhatsAppSetup = ({ userId }: { userId: string }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<Record<PrefKey, boolean>>({
    reminders: true,
    fasting_notification: true,
    weekly_objectives: true,
    motivational: true,
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("whatsapp_subscriptions")
        .select("phone_number, verified, preferences")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setPhoneNumber(data.phone_number || "");
        setIsConnected(!!data.verified);
        if (data.preferences && typeof data.preferences === "object") {
          const p = data.preferences as Record<string, unknown>;
          setPreferences({
            reminders: p.reminders !== false,
            fasting_notification: p.fasting_notification !== false,
            weekly_objectives: p.weekly_objectives !== false,
            motivational: p.motivational !== false,
          });
        }
      }
    };
    load();
  }, [userId]);

  const normalizePhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (phone.includes('whatsapp:')) {
      cleaned = phone.split('whatsapp:')[1].replace(/[^\d+]/g, '');
    }
    if (cleaned.startsWith('+55') && cleaned.length === 14) return cleaned;
    if (cleaned.startsWith('55') && cleaned.length === 13) return '+' + cleaned;
    if (cleaned.length === 11 && !cleaned.startsWith('+')) return '+55' + cleaned;
    if (cleaned.length === 10 && !cleaned.startsWith('+')) {
      return `+55${cleaned.substring(0, 2)}9${cleaned.substring(2)}`;
    }
    return cleaned.startsWith('+') ? cleaned : '+55' + cleaned;
  };

  const handleConnect = async () => {
    if (!phoneNumber) {
      toast.error("Digite seu número de WhatsApp");
      return;
    }
    setIsLoading(true);
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    try {
      const { error } = await supabase
        .from('whatsapp_subscriptions')
        .upsert({
          user_id: userId,
          phone_number: normalizedPhone,
          verified: true,
          preferences
        });
      if (error) throw error;
      toast.success("WhatsApp conectado!", {
        description: `Envie "oi" para +1 555 886 8273 no WhatsApp`
      });
      setIsConnected(true);
    } catch (error: any) {
      console.error('Error connecting WhatsApp:', error);
      toast.error("Erro ao conectar WhatsApp", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePref = async (key: PrefKey, value: boolean) => {
    const prev = { ...preferences };
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    try {
      const { error } = await supabase
        .from("whatsapp_subscriptions")
        .update({ preferences: updated })
        .eq("user_id", userId);
      if (error) throw error;
      toast.success(value ? "Notificação ativada" : "Notificação desativada");
    } catch {
      setPreferences(prev);
      toast.error("Erro ao atualizar preferência");
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
            <Button onClick={handleConnect} disabled={isLoading} className="w-full">
              {isLoading ? "Conectando..." : "Conectar WhatsApp"}
            </Button>
          )}

          {isConnected && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Preferências de Notificação</h4>
              {PREF_ITEMS.map(({ key, label, desc, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <Label htmlFor={key} className="cursor-pointer text-sm font-medium">{label}</Label>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <Switch
                    id={key}
                    checked={preferences[key]}
                    onCheckedChange={(v) => handleTogglePref(key, v)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
          <h4 className="font-medium">📱 Como usar:</h4>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Conecte seu número acima</li>
            <li>Envie "oi" para +1 555 886 8273 no WhatsApp</li>
            <li>Envie fotos de comida para análise automática</li>
            <li>Use comandos como "resumo", "meta", "semanal"</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
