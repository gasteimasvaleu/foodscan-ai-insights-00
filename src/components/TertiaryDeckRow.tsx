import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const TertiaryDeckRow: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-[1.6fr_1fr] gap-3 items-stretch">
      {/* Card esquerdo: Desafio 14 Dias (16:9) */}
      <button
        onClick={() => navigate('/desafio-14-dias')}
        className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
        aria-label="Desafio 14 Dias"
      >
        <img
          src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/image_1778754615806_99ffb4e5.png"
          alt="Desafio 14 Dias"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="invisible aspect-[5/4]" />
        <div className="absolute bottom-0 inset-x-0 bg-black/55 backdrop-blur-sm px-3 py-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-white/70">
              Novidade
            </p>
            <p className="text-base text-white truncate">
              Desafio 14 Dias
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-white flex-shrink-0" />
        </div>
      </button>

      {/* Card direito: Conquistas */}
      <button
        onClick={() => navigate('/conquistas')}
        className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl active:scale-[0.98] transition-all aspect-[4/5]"
        aria-label="Conquistas"
      >
        <img
          src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/image_1778753342779_756d33ee.png"
          alt="Conquistas"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </button>
    </div>
  );
};
