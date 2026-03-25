
import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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
  const [manualGrams, setManualGrams] = useState<string>('');
  const [selectedPortion, setSelectedPortion] = useState<string>('');

  const handlePortionChange = (value: string) => {
    const selectedOption = portionOptions.find(option => option.value === value);
    if (selectedOption) {
      setSelectedPortion(value);
      setManualGrams(''); // Limpa o input manual
      onPortionChange(selectedOption.label, selectedOption.grams);
    }
  };

  const handleManualGramsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualGrams(value);
    
    if (value) {
      setSelectedPortion(''); // Limpa o select
      const grams = parseInt(value) || 0;
      onPortionChange(`${grams}g`, grams);
    }
  };

  return (
    <div className="bg-[#F9FAFB] border border-white/20 rounded-3xl p-6">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-800">
            Ajustar Porção
          </h4>
          <p className="text-sm text-gray-600">
            Selecione o tamanho da porção que você consumiu
          </p>
        </div>
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Select onValueChange={handlePortionChange} value={selectedPortion}>
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
          
          <div className="text-amber-600 font-medium text-sm">ou</div>
          
          <div className="flex-1">
            <div className="relative">
              <Input
                type="number"
                placeholder="Gramas"
                value={manualGrams}
                onChange={handleManualGramsChange}
                className="bg-white border-amber-200 focus:border-amber-400 pr-8"
                min="1"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 text-sm">g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
