import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WhatsAppSetup } from "@/components/WhatsAppSetup";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MessageCircle } from "lucide-react";

const WhatsAppSettings = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary pt-16">
        <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-12 animate-fade-in">
              <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl p-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-green-400 to-green-500 p-4 rounded-full">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 hover:scale-105 transition-transform duration-300">
                  Configurações WhatsApp
                </h1>
                
                <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Configure notificações e análise de fotos via WhatsApp
                </p>
              </div>
            </div>

            {userId && <WhatsAppSetup userId={userId} />}

            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">📋 Comandos Disponíveis</h3>
              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded">oi</span>
                  <span className="text-muted-foreground">Ver menu principal</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded">resumo</span>
                  <span className="text-muted-foreground">Ver resumo do dia</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded">meta</span>
                  <span className="text-muted-foreground">Ver suas metas diárias</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded">semanal</span>
                  <span className="text-muted-foreground">Ver resumo da semana</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded">ajuda</span>
                  <span className="text-muted-foreground">Ver lista de comandos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono bg-muted px-2 py-1 rounded">📸 foto</span>
                  <span className="text-muted-foreground">Envie foto para análise automática</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WhatsAppSettings;