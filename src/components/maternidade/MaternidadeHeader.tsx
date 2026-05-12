import { Baby } from 'lucide-react';

export const MaternidadeHeader = () => {
  return (
    <div className="mb-2 animate-fade-in">
      <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
        <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
          <Baby className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-lg font-bold text-[#FD46A1]">Maternidade</h1>
      </div>
    </div>
  );
};
