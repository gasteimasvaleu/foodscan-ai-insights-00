
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSubscription } from './useSubscription';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const subscription = useSubscription(user);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      return { error, data: null };
    }

    toast({
      title: "Cadastro realizado!",
      description: "Você já pode fazer login.",
    });

    return { error: null, data };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    return { error: null };
  };

  const signOut = async () => {
    // Limpar estado local primeiro
    setSession(null);
    setUser(null);

    // Se não há sessão ativa, não tentar logout no servidor
    if (!session) {
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      
      // Ignorar erro se a sessão já não existe no servidor
      if (error && !error.message.toLowerCase().includes('session')) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      // Estado local já foi limpo, então não mostrar erro crítico
      console.warn('Logout error (estado local limpo):', err);
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    subscription,
  };
};
