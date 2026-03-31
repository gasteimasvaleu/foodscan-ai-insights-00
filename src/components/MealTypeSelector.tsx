import React from 'react';

const MEAL_TYPES = [
  { value: 'cafe_da_manha', label: 'Café da Manhã', emoji: '☕' },
  { value: 'lanche', label: 'Lanche', emoji: '🍎' },
  { value: 'almoco', label: 'Almoço', emoji: '🍽️' },
  { value: 'jantar', label: 'Jantar', emoji: '🌙' },
  { value: 'ceia', label: 'Ceia', emoji: '🌜' },
];

export const MEAL_TYPE_MAP: Record<string, { label: string; emoji: string }> = Object.fromEntries(
  MEAL_TYPES.map(t => [t.value, { label: t.label, emoji: t.emoji }])
);

interface MealTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-2">Tipo de Refeição</p>
      <div className="flex flex-wrap gap-2">
        {MEAL_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              value === type.value
                ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                : 'bg-white/80 text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-primary/10'
            }`}
          >
            {type.emoji} {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};
