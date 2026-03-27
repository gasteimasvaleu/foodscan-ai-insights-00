import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { AuthCard } from "@/components/AuthCard";
import { UtensilsCrossed } from "lucide-react";

const Receitas = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD46A1]" />
      </div>
    );
  }

  if (!user) {
    return <AuthCard />;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <div className="container max-w-lg mx-auto px-4 pt-20">
        <div className="mb-6 animate-fade-in">
          <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-[#FD46A1]">Receitas</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#FFD1E7]/40 flex items-center justify-center mb-4">
            <UtensilsCrossed size={36} className="text-[#FD46A1]" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Nenhuma receita salva ainda
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Em breve você poderá salvar e organizar suas receitas favoritas aqui.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Receitas;
