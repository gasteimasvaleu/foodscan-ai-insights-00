import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { uploadToSupabase } from "@/utils/uploadToSupabase";

interface Assessment {
  id: string;
  assessment_date: string;
  weight: number;
  height: number;
  waist: number;
  neck: number;
  body_fat_percentage: number;
  lean_mass: number;
  fat_mass: number;
  before_photo_url: string | null;
  after_photo_url: string | null;
  notes: string | null;
}

export default function PhysicalAssessment() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    assessment_date: new Date().toISOString().split("T")[0],
    weight: "",
    height: "",
    waist: "",
    neck: "",
    body_fat_percentage: "",
    lean_mass: "",
    fat_mass: "",
    notes: "",
  });

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from("physical_assessments")
        .select("*")
        .eq("user_id", user.user.id)
        .order("assessment_date", { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error("Error loading assessments:", error);
      toast.error("Erro ao carregar avaliações");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      let beforePhotoUrl = null;
      let afterPhotoUrl = null;

      if (beforePhoto) {
        const result = await uploadToSupabase(beforePhoto, `${user.user.id}/before`);
        beforePhotoUrl = result.url;
      }

      if (afterPhoto) {
        const result = await uploadToSupabase(afterPhoto, `${user.user.id}/after`);
        afterPhotoUrl = result.url;
      }

      const assessmentData = {
        user_id: user.user.id,
        assessment_date: formData.assessment_date,
        weight: parseFloat(formData.weight) || null,
        height: parseFloat(formData.height) || null,
        waist: parseFloat(formData.waist) || null,
        neck: parseFloat(formData.neck) || null,
        body_fat_percentage: parseFloat(formData.body_fat_percentage) || null,
        lean_mass: parseFloat(formData.lean_mass) || null,
        fat_mass: parseFloat(formData.fat_mass) || null,
        before_photo_url: beforePhotoUrl,
        after_photo_url: afterPhotoUrl,
        notes: formData.notes || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("physical_assessments")
          .update(assessmentData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Avaliação atualizada");
      } else {
        const { error } = await supabase.from("physical_assessments").insert(assessmentData);

        if (error) throw error;
        toast.success("Avaliação registrada");
      }

      setDialogOpen(false);
      resetForm();
      loadAssessments();
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Erro ao salvar avaliação");
    }
  };

  const resetForm = () => {
    setFormData({
      assessment_date: new Date().toISOString().split("T")[0],
      weight: "",
      height: "",
      waist: "",
      neck: "",
      body_fat_percentage: "",
      lean_mass: "",
      fat_mass: "",
      notes: "",
    });
    setBeforePhoto(null);
    setAfterPhoto(null);
    setEditingId(null);
  };

  const deleteAssessment = async (id: string) => {
    try {
      const { error } = await supabase.from("physical_assessments").delete().eq("id", id);

      if (error) throw error;
      toast.success("Avaliação excluída");
      loadAssessments();
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error("Erro ao excluir avaliação");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 pb-28">
        <div className="max-w-4xl mx-auto">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 pb-28">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Avaliação Física</h1>
            <p className="text-muted-foreground">Acompanhe sua evolução</p>
          </div>
          <Button className="w-full" onClick={() => navigate("/profile")}>
            Voltar
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Avaliação
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Avaliação" : "Nova Avaliação"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={formData.assessment_date}
                      onChange={(e) =>
                        setFormData({ ...formData, assessment_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Peso (kg)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Altura (cm)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Cintura (cm)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.waist}
                      onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Pescoço (cm)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.neck}
                      onChange={(e) => setFormData({ ...formData, neck: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>% de Gordura</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.body_fat_percentage}
                      onChange={(e) =>
                        setFormData({ ...formData, body_fat_percentage: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Massa Magra (kg)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.lean_mass}
                      onChange={(e) => setFormData({ ...formData, lean_mass: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Massa Gorda (kg)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.fat_mass}
                      onChange={(e) => setFormData({ ...formData, fat_mass: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Foto Antes</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBeforePhoto(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <Label>Foto Depois</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAfterPhoto(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Atualizar" : "Salvar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {assessments.length === 0 ? (
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhuma avaliação registrada ainda
              </CardContent>
            </Card>
          ) : (
            assessments.map((assessment) => (
              <Card key={assessment.id} className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        📅 {format(new Date(assessment.assessment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </CardTitle>
                      <CardDescription>
                        Peso: {assessment.weight}kg | Gordura: {assessment.body_fat_percentage}% |
                        Magra: {assessment.lean_mass}kg
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAssessment(assessment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {assessment.before_photo_url && (
                      <div>
                        <p className="text-sm font-medium mb-2">Antes</p>
                        <img
                          src={assessment.before_photo_url}
                          alt="Antes"
                          className="rounded-lg w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    {assessment.after_photo_url && (
                      <div>
                        <p className="text-sm font-medium mb-2">Depois</p>
                        <img
                          src={assessment.after_photo_url}
                          alt="Depois"
                          className="rounded-lg w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {assessment.notes && (
                    <p className="mt-4 text-sm text-muted-foreground">{assessment.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
