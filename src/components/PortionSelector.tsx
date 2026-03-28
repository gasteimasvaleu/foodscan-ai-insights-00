
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
  // Talheres e utensílios
  { label: 'Colher de Chá', value: 'colher-cha', grams: 5 },
  { label: 'Colher de Sopa', value: 'colher-sopa', grams: 15 },
  { label: 'Colher de Servir', value: 'colher-servir', grams: 45 },
  { label: 'Espátula', value: 'espatula', grams: 30 },
  { label: 'Concha Média', value: 'concha-media', grams: 120 },
  { label: 'Concha Grande', value: 'concha-grande', grams: 180 },
  // Copos e xícaras
  { label: 'Xícara de Café', value: 'xicara-cafe', grams: 50 },
  { label: 'Copo Pequeno', value: 'copo-pequeno', grams: 100 },
  { label: 'Xícara de Chá', value: 'xicara-cha', grams: 180 },
  { label: 'Copo Médio', value: 'copo-medio', grams: 200 },
  { label: 'Copo Grande', value: 'copo-grande', grams: 300 },
  { label: 'Caneca', value: 'caneca', grams: 300 },
  // Pratos e tigelas
  { label: 'Pires', value: 'pires', grams: 100 },
  { label: 'Prato Pequeno', value: 'prato-pequeno', grams: 150 },
  { label: 'Tigela Pequena', value: 'tigela-pequena', grams: 200 },
  { label: 'Prato Médio', value: 'prato-medio', grams: 250 },
  { label: 'Prato Grande', value: 'prato-grande', grams: 350 },
  { label: 'Tigela Média', value: 'tigela-media', grams: 350 },
  { label: 'Tigela Grande', value: 'tigela-grande', grams: 500 },
  // Unidades e pedaços
  { label: 'Sachê', value: 'sache', grams: 10 },
  { label: 'Pacote Individual', value: 'pacote-individual', grams: 25 },
  { label: 'Pedaço Pequeno', value: 'pedaco-pequeno', grams: 30 },
  { label: 'Fatia Fina', value: 'fatia-fina', grams: 40 },
  { label: 'Unidade Pequena', value: 'unidade-pequena', grams: 50 },
  { label: 'Pedaço Médio', value: 'pedaco-medio', grams: 60 },
  { label: 'Fatia', value: 'fatia', grams: 80 },
  { label: 'Unidade Média', value: 'unidade-media', grams: 100 },
  { label: 'Fatia Grossa', value: 'fatia-grossa', grams: 120 },
  { label: 'Pedaço Grande', value: 'pedaco-grande', grams: 120 },
  { label: 'Unidade Grande', value: 'unidade-grande', grams: 150 },
  { label: 'Porção de Restaurante', value: 'porcao-restaurante', grams: 300 },
  // Medidas de mão
  { label: 'Punhado', value: 'punhado', grams: 30 },
  { label: 'Palma da Mão', value: 'palma-mao', grams: 100 },
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
              <SelectTrigger className="w-full bg-white border-gray-800 focus:border-gray-900">
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
          
          <div className="text-gray-800 font-medium text-sm">ou</div>
          
          <div className="flex-1">
            <div className="relative">
              <Input
                type="number"
                placeholder="Gramas"
                value={manualGrams}
                onChange={handleManualGramsChange}
                className="bg-white border-gray-800 focus:border-gray-900 pr-8"
                min="1"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-800 text-sm">g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
