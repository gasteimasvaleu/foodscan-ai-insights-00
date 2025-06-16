
import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DailyGoal } from '@/types/daily-control';

interface GoalsFormProps {
  onSave: (goals: Omit<DailyGoal, 'id' | 'created_at' | 'user_id'>) => void;
  onCancel: () => void;
  initialGoals?: DailyGoal | null;
}

export const GoalsForm: React.FC<GoalsFormProps> = ({ 
  onSave, 
  onCancel, 
  initialGoals 
}) => {
  const [formData, setFormData] = useState({
    calories: initialGoals?.calories || 2000,
    carbohydrates: initialGoals?.carbohydrates || 250,
    proteins: initialGoals?.proteins || 150,
    fats: initialGoals?.fats || 65,
    diet_objective: initialGoals?.diet_objective || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          {initialGoals ? 'Editar Metas' : 'Configurar Metas Diárias'}
        </h3>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="rounded-xl"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="calories">Calorias (kcal)</Label>
            <Input
              id="calories"
              type="number"
              value={formData.calories}
              onChange={(e) => handleInputChange('calories', parseInt(e.target.value) || 0)}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carbohydrates">Carboidratos (g)</Label>
            <Input
              id="carbohydrates"
              type="number"
              value={formData.carbohydrates}
              onChange={(e) => handleInputChange('carbohydrates', parseInt(e.target.value) || 0)}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proteins">Proteínas (g)</Label>
            <Input
              id="proteins"
              type="number"
              value={formData.proteins}
              onChange={(e) => handleInputChange('proteins', parseInt(e.target.value) || 0)}
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fats">Gorduras (g)</Label>
            <Input
              id="fats"
              type="number"
              value={formData.fats}
              onChange={(e) => handleInputChange('fats', parseInt(e.target.value) || 0)}
              className="rounded-xl"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="diet_objective">Objetivo da Dieta</Label>
          <Textarea
            id="diet_objective"
            value={formData.diet_objective}
            onChange={(e) => handleInputChange('diet_objective', e.target.value)}
            placeholder="Ex: Perder peso, Ganhar massa muscular, Manter peso..."
            className="rounded-xl"
            required
          />
        </div>

        <div className="flex space-x-4">
          <Button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-8 flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Metas
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="rounded-xl px-8"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
