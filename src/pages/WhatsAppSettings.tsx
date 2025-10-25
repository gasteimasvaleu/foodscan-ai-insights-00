import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WhatsAppSetup } from "@/components/WhatsAppSetup";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Configurações do WhatsApp</h1>
              <p className="text-muted-foreground">
                Configure notificações e análise de fotos via WhatsApp
              </p>
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