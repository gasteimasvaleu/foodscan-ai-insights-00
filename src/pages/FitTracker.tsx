import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseForm } from "@/components/ExerciseForm";
import { ExerciseDashboard } from "@/components/ExerciseDashboard";
import { ExerciseHistory } from "@/components/ExerciseHistory";
import { Navbar } from "@/components/Navbar";


import { useAuth } from "@/hooks/useAuth";
import { AuthCard } from "@/components/AuthCard";

export default function FitTracker() {
  const { user, loading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExerciseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-16">
          <div className="max-w-md mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Acesso Restrito</h1>
              <p className="text-gray-600 mb-8">Você precisa estar logado para acessar o FitTracker</p>
            </div>
            <AuthCard mode="login" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary pt-16">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          {/* Header Card */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-2xl opacity-70 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-orange-400 to-red-500 p-6 rounded-3xl shadow-2xl">
                    <Activity className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 hover:scale-105 transition-transform duration-300">
                FitTracker
              </h1>
              
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Registre seus exercícios e acompanhe o impacto nas suas metas nutricionais
              </p>
            </div>
          </div>

          <Tabs defaultValue="register" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <TabsTrigger value="register" className="flex items-center gap-2 data-[state=active]:bg-white/90 data-[state=active]:text-blue-600 data-[state=active]:shadow-md hover:bg-white/10 transition-all duration-300 text-white drop-shadow-lg">
                <Activity className="h-4 w-4" />
                Registrar
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-white/90 data-[state=active]:text-blue-600 data-[state=active]:shadow-md hover:bg-white/10 transition-all duration-300 text-white drop-shadow-lg">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-white/90 data-[state=active]:text-blue-600 data-[state=active]:shadow-md hover:bg-white/10 transition-all duration-300 text-white drop-shadow-lg">
                <Activity className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="space-y-6">
              <ExerciseForm onExerciseAdded={handleExerciseAdded} />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <ExerciseDashboard key={refreshTrigger} />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <ExerciseHistory key={refreshTrigger} />
            </TabsContent>
          </Tabs>
        </div>
        
      </div>
  );
}