import { Link } from 'react-router-dom';

export const ToAquiPromoCard = () => {
  return (
    <Link
      to="/to-aqui"
      className="block relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-lg active:scale-[0.99] transition-transform border border-[#FD46A1]/60 animate-neon-pulse"
      aria-label="Tô Aqui — converse com quem está no mesmo lugar"
    >
      <img
        src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/021779196477043682bfa727eaa8ae907bb4f408e14b63d586dcb_0.jpeg"
        alt="Tô Aqui — converse com quem está no mesmo lugar"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/55 backdrop-blur-sm px-4 py-3">
        <p className="text-[#FFD1E7] text-xs font-bold uppercase tracking-wider">Tô Aqui</p>
        <p className="text-white text-sm leading-snug">
          Quer saber e conversar com quem tá no seu bar, festa ou restaurante? Clica aqui.
        </p>
      </div>
    </Link>
  );
};
