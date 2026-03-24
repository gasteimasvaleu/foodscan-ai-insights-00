import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentRegistrationFormProps {
  sessionId: string;
}

export const PaymentRegistrationForm = ({ sessionId }: PaymentRegistrationFormProps) => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  console.log('PaymentRegistrationForm rendered with sessionId:', sessionId);

  useEffect(() => {
    console.log('PaymentRegistrationForm mounted with sessionId:', sessionId);
  }, [sessionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // First validate the Stripe session
      const { data: validationData, error: validationError } = await supabase.functions.invoke('validate-session', {
        body: { sessionId }
      });

      if (validationError || !validationData.valid) {
        toast({
          title: "Erro",
          description: "Sessão de pagamento inválida ou não paga",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // If session is valid, create the account
      const { error } = await signUp(formData.email, formData.password, formData.name);
      
      if (!error) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao We Diet! Você já pode começar a usar.",
        });
        navigate('/', { replace: true });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao validar pagamento ou criar conta",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border border-white/20">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl text-success-600 flex items-center justify-center gap-3 mb-2">
          <CheckCircle className="w-8 h-8" />
          Pagamento Confirmado!
        </CardTitle>
        <div className="space-y-2">
          <p className="text-gray-700">
            Agora crie sua conta para começar a usar o We Diet
          </p>
          <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-lg inline-block">
            Session ID: {sessionId}
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome completo
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Digite seu nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Digite seu email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Crie uma senha (mínimo 6 caracteres)"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirmar senha
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirme sua senha"
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-3"
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar Minha Conta'}
          </Button>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              🎉 Parabéns! Você agora tem acesso completo ao We Diet
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};