import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const MaternidadeHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-b from-[#FFD1E7]/90 to-[#F7FAFB]/90 backdrop-blur-md border-b border-white/40">
      <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center shadow-sm active:scale-95 transition"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-[#FD46A1]" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg text-[#FD46A1] font-semibold leading-tight">Maternidade</h1>
          <p className="text-xs text-gray-600 leading-tight">Tentantes, gestação, pós-parto e bebê</p>
        </div>
      </div>
    </header>
  );
};
