import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        {/* Faixa inferior estilo Netflix */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pb-3 pt-8">
          <p className="text-white text-sm font-semibold leading-tight">
            Desafio 14 Dias
          </p>
          <p className="text-white/80 text-xs mt-0.5">
            Participe agora →
          </p>
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
