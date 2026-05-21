import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionPicker } from '@/components/maternidade/SectionPicker';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Shield, Loader2, MessageCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

interface RegistrationToken {
  id: string;
  token: string;
  email: string;
  name: string;
  plan_type: string;
  plan_months: number;
  is_used: boolean;
  used_at: string | null;
  expires_at: string;
  created_at: string;
  subscription_end: string;
}

const AdminSubscriptions = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [planType, setPlanType] = useState('monthly');
  const [phone, setPhone] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [sending, setSending] = useState(false);

  const [tokens, setTokens] = useState<RegistrationToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      setIsAdmin(!!data);
      setCheckingRole(false);
      if (data) fetchTokens();
    };
    if (!loading) {
      if (!user) navigate('/auth');
      else checkAdmin();
    }
  }, [user, loading, navigate]);

  const fetchTokens = async () => {
    setLoadingTokens(true);
    const { data, error } = await supabase
      .from('registration_tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setTokens(data as RegistrationToken[]);
    setLoadingTokens(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-registration-token', {
        body: { email: email.trim(), name: name.trim(), plan_type: planType },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Send WhatsApp if checked
      if (sendWhatsApp && phone.trim()) {
        try {
          const { error: whatsAppError } = await supabase.functions.invoke('send-whatsapp-invite', {
            body: {
              phone: phone.trim(),
              name: name.trim(),
              plan_type: planType,
              registration_token: data.token,
            },
          });
          if (whatsAppError) throw whatsAppError;
          toast({ title: '✅ Convite enviado!', description: `Email e WhatsApp enviados com sucesso` });
        } catch (whatsErr: any) {
          toast({ title: '⚠️ Email enviado, WhatsApp falhou', description: whatsErr.message, variant: 'destructive' });
        }
      } else {
        toast({ title: '✅ Convite enviado!', description: `Email enviado para ${email}` });
      }

      setName('');
      setEmail('');
      setPhone('');
      setSendWhatsApp(false);
      fetchTokens();
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const getStatus = (token: RegistrationToken) => {
    if (token.is_used) return { label: 'Usado', variant: 'secondary' as const };
    if (new Date(token.expires_at) < new Date()) return { label: 'Expirado', variant: 'destructive' as const };
    return { label: 'Pendente', variant: 'default' as const };
  };

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Shield className="mx-auto h-12 w-12 text-destructive mb-2" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você não tem permissão para acessar esta área.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin')} variant="outline">Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assinaturas Promocionais</h1>
            <p className="text-sm text-muted-foreground">Envie convites de acesso por email</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enviar Convite</CardTitle>
            <CardDescription>O usuário receberá um email com link para criar a conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do usuário" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Plano</Label>
                <SectionPicker
                  title="Tipo de Plano"
                  value={planType}
                  onChange={setPlanType}
                  options={[
                    { id: 'monthly', label: 'Mensal' },
                    { id: 'annual', label: 'Anual' },
                  ]}
                />

              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendWhatsApp"
                  checked={sendWhatsApp}
                  onCheckedChange={(checked) => setSendWhatsApp(checked === true)}
                />
                <Label htmlFor="sendWhatsApp" className="flex items-center gap-1.5 cursor-pointer">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  Enviar também por WhatsApp
                </Label>
              </div>
              {sendWhatsApp && (
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp (com DDD)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="5511999999999"
                  />
                  <p className="text-xs text-muted-foreground">Formato: 55 + DDD + número (ex: 5511999999999)</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Enviar Convite
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Convites Enviados</CardTitle>
            <CardDescription>{tokens.length} convite(s) registrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTokens ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tokens.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum convite enviado ainda.</p>
            ) : (
              <div className="space-y-3">
                {tokens.map((token) => {
                  const status = getStatus(token);
                  return (
                    <div key={token.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground truncate">{token.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{token.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {token.plan_type === 'monthly' ? 'Mensal' : 'Anual'} · {new Date(token.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
