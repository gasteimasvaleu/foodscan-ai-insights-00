import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseForm } from "@/components/ExerciseForm";
import { ExerciseDashboard } from "@/components/ExerciseDashboard";
import { ExerciseHistory } from "@/components/ExerciseHistory";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SubscriptionRequired } from "@/components/SubscriptionRequired";
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-16">
          <div className="max-w-md mx-auto">
            <AuthCard />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <SubscriptionRequired>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-16">
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Activity className="h-8 w-8" />
                  FitTracker - Controle de Exercícios
                </CardTitle>
                <p className="text-blue-100">
                  Registre seus exercícios e acompanhe o impacto nas suas metas nutricionais
                </p>
              </CardHeader>
            </Card>
          </div>

          <Tabs defaultValue="register" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="register" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Registrar
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
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
        <Footer />
      </div>
    </SubscriptionRequired>
  );
}