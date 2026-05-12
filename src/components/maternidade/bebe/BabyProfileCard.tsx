import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MatDatePicker } from '@/components/maternidade/MatDatePicker';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type BabyProfile = {
  user_id: string;
  name: string;
  birth_date: string;
  sex: string | null;
};

const ageLabel = (birth: string) => {
  const b = new Date(birth + 'T00:00:00');
  const now = new Date();
  const months =
    (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (months < 1) {
    const days = Math.floor((now.getTime() - b.getTime()) / 86400000);
    return `${days} dia${days === 1 ? '' : 's'}`;
  }
  if (months < 24) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  return `${Math.floor(months / 12)} anos`;
};

export function BabyProfileCard({
  profile,
  onChange,
}: {
  profile: BabyProfile | null;
  onChange: (p: BabyProfile) => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || '',
    birth_date: profile?.birth_date || new Date().toISOString().slice(0, 10),
    sex: profile?.sex || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ name: profile.name, birth_date: profile.birth_date, sex: profile.sex || '' });
  }, [profile]);

  const save = async () => {
    if (!user || !form.name || !form.birth_date) {
      toast.error('Preencha nome e data de nascimento');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from('baby_profile')
      .upsert({
        user_id: user.id,
        name: form.name,
        birth_date: form.birth_date,
        sex: form.sex || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error('Erro ao salvar');
      return;
    }
    onChange(data as BabyProfile);
    setOpen(false);
    toast.success('Perfil salvo');
  };

  return (
    <>
      <Card className="border-none bg-[#FFD1E7] rounded-3xl">
        <CardContent className="pt-5 pb-5">
          {profile ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base text-gray-800">{profile.name}</p>
                <p className="text-sm text-gray-600">{ageLabel(profile.birth_date)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
                className="text-[#FD46A1]"
              >
                Editar
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-base text-gray-800">Configure o perfil do bebê</p>
              <Button onClick={() => setOpen(true)} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white">
                Adicionar bebê
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Perfil do bebê</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Maria"
                className="text-base h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Data de nascimento</Label>
              <MatDatePicker
                value={form.birth_date}
                onChange={(v) => setForm({ ...form, birth_date: v })}
                disabled={(d) => d > new Date()}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700">Sexo (opcional)</Label>
              <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                <SelectTrigger className="text-base h-12 rounded-xl">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="outro">Prefiro não dizer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={saving} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-xl">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { ageLabel };
