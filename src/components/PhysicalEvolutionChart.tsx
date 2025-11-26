import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Assessment {
  assessment_date: string;
  weight: number;
  body_fat_percentage: number;
  lean_mass: number;
  fat_mass: number;
}

export const PhysicalEvolutionChart = () => {
  const [data, setData] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: assessments, error } = await supabase
        .from("physical_assessments")
        .select("assessment_date, weight, body_fat_percentage, lean_mass, fat_mass")
        .eq("user_id", user.user.id)
        .order("assessment_date", { ascending: true })
        .limit(10);

      if (error) throw error;
      setData(assessments || []);
    } catch (error) {
      console.error("Error loading assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Evolução Física</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Evolução Física</CardTitle>
          <CardDescription>Nenhuma avaliação registrada ainda</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    date: format(new Date(item.assessment_date), "dd/MM", { locale: ptBR }),
    "Peso (kg)": item.weight,
    "Gordura (%)": item.body_fat_percentage,
    "Massa Magra (kg)": item.lean_mass,
    "Massa Gorda (kg)": item.fat_mass,
  }));

  return (
    <Card className="mb-8 bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">📊 Evolução Física</CardTitle>
        <CardDescription>Acompanhe sua evolução ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="Peso (kg)" stroke="#6C63FF" strokeWidth={2} />
            <Line type="monotone" dataKey="Gordura (%)" stroke="#f97316" strokeWidth={2} />
            <Line type="monotone" dataKey="Massa Magra (kg)" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="Massa Gorda (kg)" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
