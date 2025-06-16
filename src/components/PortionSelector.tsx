
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortionSelectorProps {
  selectedPortion: number;
  onPortionChange: (portion: number) => void;
}

export const PortionSelector: React.FC<PortionSelectorProps> = ({
  selectedPortion,
  onPortionChange,
}) => {
  const handleDecrease = () => {
    if (selectedPortion > 0.25) {
      onPortionChange(Math.max(0.25, selectedPortion - 0.25));
    }
  };

  const handleIncrease = () => {
    if (selectedPortion < 5) {
      onPortionChange(Math.min(5, selectedPortion + 0.25));
    }
  };

  const formatPortion = (portion: number) => {
    if (portion === 1) return '1 porção';
    if (portion < 1) return `${portion} porção`;
    return `${portion} porções`;
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <div className="text-center space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">
          Ajustar Porção
        </h4>
        
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={handleDecrease}
            disabled={selectedPortion <= 0.25}
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12"
          >
            <Minus className="w-4 h-4" />
          </Button>
          
          <div className="text-center min-w-[120px]">
            <div className="text-2xl font-bold text-primary-600">
              {selectedPortion}x
            </div>
            <div className="text-sm text-gray-600">
              {formatPortion(selectedPortion)}
            </div>
          </div>
          
          <Button
            onClick={handleIncrease}
            disabled={selectedPortion >= 5}
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          Ajuste a quantidade para obter valores nutricionais precisos
        </div>
      </div>
    </div>
  );
};
