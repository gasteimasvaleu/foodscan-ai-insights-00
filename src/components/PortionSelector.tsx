
import React from 'react';
import { Scale } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PortionOption {
  label: string;
  value: string;
  grams: number;
}

interface PortionSelectorProps {
  currentPortion: string;
  onPortionChange: (portion: string, grams: number) => void;
}

const portionOptions: PortionOption[] = [
  { label: 'Prato Pequeno', value: 'prato-pequeno', grams: 150 },
  { label: 'Prato Médio', value: 'prato-medio', grams: 250 },
  { label: 'Prato Grande', value: 'prato-grande', grams: 350 },
  { label: 'Copo Pequeno', value: 'copo-pequeno', grams: 100 },
  { label: 'Copo Médio', value: 'copo-medio', grams: 200 },
  { label: 'Copo Grande', value: 'copo-grande', grams: 300 },
  { label: 'Fatia', value: 'fatia', grams: 80 },
  { label: 'Colher de Chá', value: 'colher-cha', grams: 5 },
];

export const PortionSelector: React.FC<PortionSelectorProps> = ({ 
  currentPortion, 
  onPortionChange 
}) => {
  const handlePortionChange = (value: string) => {
    const selectedOption = portionOptions.find(option => option.value === value);
    if (selectedOption) {
      onPortionChange(selectedOption.label, selectedOption.grams);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="bg-amber-100 rounded-full p-3">
          <Scale className="w-6 h-6 text-amber-600" />
        </div>
        <div className="text-center">
          <h4 className="text-lg font-semibold text-amber-800">
            Ajustar Porção
          </h4>
          <p className="text-sm text-amber-600">
            Selecione o tamanho da porção que você consumiu
          </p>
        </div>
      </div>
      
      <div className="max-w-xs mx-auto">
        <Select onValueChange={handlePortionChange} defaultValue="">
          <SelectTrigger className="w-full bg-white border-amber-200 focus:border-amber-400">
            <SelectValue placeholder="Escolha uma porção" />
          </SelectTrigger>
          <SelectContent>
            {portionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ({option.grams}g)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
