import React, { useState } from 'react';
import { Utensils } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FoodElement, ElementPortion } from '@/types/nutrition';

interface PortionOption {
  label: string;
  value: string;
  grams: number;
}

interface MultipleElementsPortionSelectorProps {
  elements: FoodElement[];
  onPortionsChange: (portions: ElementPortion[]) => void;
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

export const MultipleElementsPortionSelector: React.FC<MultipleElementsPortionSelectorProps> = ({
  elements,
  onPortionsChange
}) => {
  const [elementPortions, setElementPortions] = useState<ElementPortion[]>(
    elements.map(element => {
      const estimatedGrams = element.estimated_grams || 100;
      return {
        elementName: element.name,
        portion: `${estimatedGrams}g`,
        grams: estimatedGrams
      };
    })
  );

  const updateElementPortion = (elementIndex: number, portion: string, grams: number) => {
    const newPortions = [...elementPortions];
    newPortions[elementIndex] = {
      ...newPortions[elementIndex],
      portion,
      grams
    };
    setElementPortions(newPortions);
    onPortionsChange(newPortions);
  };

  const handlePortionChange = (elementIndex: number, value: string) => {
    const selectedOption = portionOptions.find(option => option.value === value);
    if (selectedOption) {
      updateElementPortion(elementIndex, selectedOption.label, selectedOption.grams);
    }
  };

  const handleManualGramsChange = (elementIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const grams = parseInt(value) || 0;
      updateElementPortion(elementIndex, `${grams}g`, grams);
    }
  };

  return (
    <div className="bg-[#F9FAFB] border border-white/20 rounded-3xl p-6">
      <div className="flex items-center justify-center mb-6">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-800">
            Ajustar Porções por Elemento
          </h4>
          <p className="text-sm text-gray-600">
            Selecione o tamanho da porção para cada elemento do prato
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        {elements.map((element, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Utensils className="w-4 h-4 text-gray-600" />
              <h5 className="font-medium text-gray-800">{element.name}</h5>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Select 
                  onValueChange={(value) => handlePortionChange(index, value)}
                  value={elementPortions[index]?.portion && 
                    portionOptions.find(opt => opt.label === elementPortions[index].portion)?.value || ''}
                >
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
                    value={elementPortions[index]?.portion?.includes('g') && 
                      !portionOptions.some(opt => opt.label === elementPortions[index].portion) 
                      ? elementPortions[index].grams.toString() 
                      : ''}
                    onChange={(e) => handleManualGramsChange(index, e)}
                    className="bg-white border-gray-800 focus:border-gray-900 pr-8"
                    min="1"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-800 text-sm">g</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};