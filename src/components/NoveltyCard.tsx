import { Link } from 'react-router-dom';

export const NoveltyCard = () => {
  return (
    <Link
      to="/quiz"
      className="block relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-lg active:scale-[0.99] transition-transform"
      aria-label="Promoção Quiz — 1º lugar leva R$500"
    >
      <img
        src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/0217792196146522b8720b6d986e81ce95e9b006de0a2cb27ba73_0.jpeg"
        alt="Promoção Quiz We Diet — R$500 para o 1º lugar"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/55 backdrop-blur-sm px-4 py-3">
        <p className="text-[#FFD1E7] text-xs font-bold uppercase tracking-wider">Prêmio de R$500</p>
        <p className="text-white text-sm leading-snug">
          Fique em 1º no ranking do Quiz e leve R$500. Bora jogar agora! 🏆
        </p>
      </div>
    </Link>
  );
};
