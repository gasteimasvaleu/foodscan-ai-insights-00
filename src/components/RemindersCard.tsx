import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { Bell, Plus, Eye, CalendarIcon, Trash2, Droplets, Pill, UtensilsCrossed, Dumbbell, StretchHorizontal, Brain, Scale, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Reminder {
  id: string;
  title: string;
  reminder_type: string;
  reminder_date: string;
  reminder_time: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

const REMINDER_TYPES = [
  { value: "agua", label: "Beber Água", icon: Droplets },
  { value: "suplemento", label: "Tomar Suplemento", icon: Pill },
  { value: "refeicao", label: "Hora da Refeição", icon: UtensilsCrossed },
  { value: "treino", label: "Treino / Exercício", icon: Dumbbell },
  { value: "alongamento", label: "Alongamento", icon: StretchHorizontal },
  { value: "meditacao", label: "Meditação / Relaxamento", icon: Brain },
  { value: "pesar", label: "Pesar-se", icon: Scale },
  { value: "personalizado", label: "Personalizado", icon: Edit2 },
];

function getReminderLabel(type: string) {
  return REMINDER_TYPES.find((t) => t.value === type)?.label || type;
}

function getReminderIcon(type: string) {
  const found = REMINDER_TYPES.find((t) => t.value === type);
  if (!found) return Bell;
  return found.icon;
}

interface RemindersCardProps {
  userId: string;
}

export function RemindersCard({ userId }: RemindersCardProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [reminderType, setReminderType] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [reminderTime, setReminderTime] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadReminders();
  }, [userId]);

  const loadReminders = async () => {
    try {
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("reminder_date", { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error("Erro ao carregar lembretes:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setReminderType("");
    setCustomTitle("");
    setSelectedDate(undefined);
    setReminderTime("");
    setDescription("");
  };

  const handleSave = async () => {
    if (!reminderType || !selectedDate || !reminderTime) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    const title = reminderType === "personalizado"
      ? customTitle
      : getReminderLabel(reminderType);

    if (reminderType === "personalizado" && !customTitle.trim()) {
      toast({ title: "Digite um título para o lembrete personalizado", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("reminders").insert({
        user_id: userId,
        title,
        reminder_type: reminderType,
        reminder_date: format(selectedDate, "yyyy-MM-dd"),
        reminder_time: reminderTime,
        description: description || null,
      });

      if (error) throw error;

      toast({ title: "Lembrete adicionado com sucesso!" });
      resetForm();
      setAddOpen(false);
      loadReminders();
    } catch (error) {
      console.error("Erro ao salvar lembrete:", error);
      toast({ title: "Erro ao salvar lembrete", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Lembrete removido!" });
      loadReminders();
    } catch (error) {
      console.error("Erro ao deletar lembrete:", error);
      toast({ title: "Erro ao remover lembrete", variant: "destructive" });
    }
  };

  return (
    <Card className="mb-8 bg-[#FFD1E7] rounded-3xl shadow-xl border border-white/20">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-semibold">Lembretes</CardTitle>
        <CardDescription className="text-center">Gerencie seus lembretes de saúde e bem-estar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {/* Adicionar Lembrete */}
          <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <div className="bg-[#F9FAFB] rounded-2xl flex flex-row items-center gap-4 py-4 px-5 cursor-pointer hover:shadow-md transition-all">
                <Plus className="h-8 w-8 text-pink-500 shrink-0" />
                <div>
                  <p className="font-semibold">Adicionar Lembrete</p>
                  <p className="text-xs text-muted-foreground">Crie um novo lembrete</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Lembrete</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Tipo */}
                <div className="space-y-2">
                  <Label>Tipo de Lembrete</Label>
                  <Select value={reminderType} onValueChange={setReminderType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Título personalizado */}
                {reminderType === "personalizado" && (
                  <div className="space-y-2">
                    <Label>Título do Lembrete</Label>
                    <Input
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Ex: Tomar vitamina D"
                    />
                  </div>
                )}

                {/* Data */}
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate
                          ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Hora */}
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes adicionais..."
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? "Salvando..." : "Salvar Lembrete"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Visualizar Lembretes */}
          {reminders.length > 0 && (
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
              <DialogTrigger asChild>
                <div className="bg-[#F9FAFB] rounded-2xl flex flex-row items-center gap-4 py-4 px-5 cursor-pointer hover:shadow-md transition-all">
                  <Eye className="h-8 w-8 text-pink-500 shrink-0" />
                  <div>
                    <p className="font-semibold">Visualizar Lembretes</p>
                    <p className="text-xs text-muted-foreground">{reminders.length} lembrete{reminders.length !== 1 ? "s" : ""} ativo{reminders.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Meus Lembretes</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {reminders.map((reminder) => {
                    const Icon = getReminderIcon(reminder.reminder_type);
                    return (
                      <div
                        key={reminder.id}
                        className="bg-[#F9FAFB] rounded-xl p-4 flex items-start gap-3"
                      >
                        <Icon className="h-5 w-5 text-pink-500 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{reminder.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(reminder.reminder_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })} às {reminder.reminder_time.slice(0, 5)}
                          </p>
                          {reminder.description && (
                            <p className="text-xs text-muted-foreground mt-1">{reminder.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
