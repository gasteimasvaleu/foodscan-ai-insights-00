import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseForm } from "@/components/ExerciseForm";
import { ExerciseDashboard } from "@/components/ExerciseDashboard";
import { ExerciseHistory } from "@/components/ExerciseHistory";
import { Navbar } from "@/components/Navbar";
import { HealthKitConnect } from "@/components/HealthKitConnect";
import { HealthKitDashboard } from "@/components/HealthKitDashboard";
import { useHealthKit } from "@/hooks/useHealthKit";
import { useAuth } from "@/hooks/useAuth";
import { AuthCard } from "@/components/AuthCard";

const HEALTHKIT_DISMISSED_KEY = 'healthkit_prompt_dismissed';

export default function FitTracker() {
  const { user, loading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [promptDismissed, setPromptDismissed] = useState(
    () => localStorage.getItem(HEALTHKIT_DISMISSED_KEY) === 'true'
  );

  const {
    isSupported,
    isConnected,
    isLoading: hkLoading,
    dailySteps,
    dailyCalories,
    weight,
    requestPermissions,
    disconnect,
    refreshData,
  } = useHealthKit();

  const handleExerciseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDismissPrompt = () => {
    localStorage.setItem(HEALTHKIT_DISMISSED_KEY, 'true');
    setPromptDismissed(true);
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem(HEALTHKIT_DISMISSED_KEY);
    setPromptDismissed(false);
  };

  const showHealthKitPrompt = isSupported && !isConnected && !promptDismissed;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary pb-28">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-[calc(env(safe-area-inset-top)+2.5rem)]">
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
      <div className="min-h-screen bg-gradient-primary pb-28">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-[calc(env(safe-area-inset-top)+2.5rem)]">
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
    <div className="min-h-screen bg-gradient-primary pt-[calc(env(safe-area-inset-top)+2.5rem)] pb-28">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          {/* Header Card */}
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#FD46A1]">FitTracker</h1>
            </div>
          </div>

          {/* HealthKit Connect Prompt */}
          {showHealthKitPrompt && (
            <HealthKitConnect
              onConnect={requestPermissions}
              onDismiss={handleDismissPrompt}
              isLoading={hkLoading}
            />
          )}

          <Tabs defaultValue="register" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="register" className="gap-2">
                <Activity className="h-4 w-4" />
                Registrar
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Activity className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="space-y-6">
              <ExerciseForm onExerciseAdded={handleExerciseAdded} />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              {isConnected && (
                <HealthKitDashboard
                  dailySteps={dailySteps}
                  dailyCalories={dailyCalories}
                  weight={weight}
                  isLoading={hkLoading}
                  onRefresh={refreshData}
                  onDisconnect={handleDisconnect}
                />
              )}
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
