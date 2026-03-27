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
        <h1 className="text-2xl font-bold text-foreground mb-6">🍽️ Receitas</h1>

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
