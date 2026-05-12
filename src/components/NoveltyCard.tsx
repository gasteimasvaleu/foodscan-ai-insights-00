import { Link } from 'react-router-dom';

export const NoveltyCard = () => {
  return (
    <Link
      to="/maternidade"
      className="block relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-lg active:scale-[0.99] transition-transform"
      aria-label="Novidade: seção Maternidade"
    >
      <img
        src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/image_1778616139478_559b027e.png"
        alt="Maternidade no We Diet"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/55 backdrop-blur-sm px-4 py-3">
        <p className="text-[#FFD1E7] text-xs font-bold uppercase tracking-wider">Novidade</p>
        <p className="text-white text-sm leading-snug">
          Maternidade: tentantes, gestação, pós-parto e bebê em um só lugar.
        </p>
      </div>
    </Link>
  );
};
