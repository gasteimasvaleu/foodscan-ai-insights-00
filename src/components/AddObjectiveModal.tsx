import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OBJECTIVE_CATALOG, ObjectiveKey } from '@/hooks/useObjectives';
import { Cookie, Pizza, Candy, ShieldCheck, Apple, Dumbbell, Leaf, ChefHat, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ICON_MAP: Record<string, React.ElementType> = {
  Cookie, Pizza, Candy, ShieldCheck, Apple, Dumbbell, Leaf, ChefHat,
};

interface AddObjectiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (key: ObjectiveKey, target: number, unit: string) => Promise<any>;
  existingKeys: string[];
}

export const AddObjectiveModal: React.FC<AddObjectiveModalProps> = ({
  open, onOpenChange, onAdd, existingKeys
}) => {
  const [selectedKey, setSelectedKey] = useState<ObjectiveKey | null>(null);
  const [targetValue, setTargetValue] = useState<number>(3);
  const [saving, setSaving] = useState(false);

  const handleSelect = (key: ObjectiveKey) => {
    setSelectedKey(key);
    setTargetValue(OBJECTIVE_CATALOG[key].defaultTarget);
  };

  const handleSave = async () => {
    if (!selectedKey) return;
    setSaving(true);
    const error = await onAdd(selectedKey, targetValue, OBJECTIVE_CATALOG[selectedKey].defaultUnit);
    setSaving(false);
    if (!error) {
      toast({ title: 'Objetivo adicionado! 🎯' });
      setSelectedKey(null);
      onOpenChange(false);
    } else {
      toast({ title: 'Erro ao adicionar objetivo', variant: 'destructive' });
    }
  };

  const availableKeys = (Object.keys(OBJECTIVE_CATALOG) as ObjectiveKey[]).filter(
    k => !existingKeys.includes(k)
  );

  const isPositive = selectedKey && ['no_overeating', 'healthy_eating', 'start_exercising', 'home_cooking'].includes(selectedKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">Adicionar Objetivo 🎯</DialogTitle>
          <DialogDescription>Escolha um objetivo e configure sua meta semanal</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-3">
          {availableKeys.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Todos os objetivos já foram adicionados! 🎉</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2">
                {availableKeys.map((key) => {
                  const cat = OBJECTIVE_CATALOG[key];
                  const Icon = ICON_MAP[cat.icon];
                  const selected = selectedKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelect(key)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        selected
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-[#F9FAFB] border-2 border-transparent hover:border-primary/30'
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        {Icon && <Icon className="h-4 w-4" style={{ color: cat.color }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                      {selected && <Check className="h-5 w-5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {selectedKey && (
                <div className="bg-[#F9FAFB] rounded-xl p-4 space-y-3">
                  <Label className="text-sm font-semibold">
                    {isPositive ? 'Meta mínima por semana' : 'Limite máximo por semana'}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setTargetValue(Math.max(1, targetValue - 1))}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={targetValue}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                      className="w-20 text-center font-bold text-lg"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setTargetValue(targetValue + 1)}
                    >
                      +
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {isPositive ? 'dias' : 'vezes'}/semana
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {selectedKey && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl"
          >
            {saving ? 'Salvando...' : 'Adicionar Objetivo'}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
