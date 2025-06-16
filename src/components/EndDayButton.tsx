
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface EndDayButtonProps {
  onEndDay: () => void;
  isAnalyzing: boolean;
  disabled?: boolean;
}

export const EndDayButton: React.FC<EndDayButtonProps> = ({
  onEndDay,
  isAnalyzing,
  disabled = false
}) => {
  return (
    <div className="text-center">
      <Button
        onClick={onEndDay}
        disabled={isAnalyzing || disabled}
        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isAnalyzing ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Analisando...
          </div>
        ) : (
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Encerrar Dia
          </div>
        )}
      </Button>
    </div>
  );
};
