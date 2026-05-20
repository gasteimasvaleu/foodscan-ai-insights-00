import { Link } from 'react-router-dom';

export const MercadoFacilPromoCard = () => {
  return (
    <Link
      to="/mercado-facil"
      className="block relative w-full aspect-[21/9] rounded-3xl overflow-hidden shadow-lg active:scale-[0.99] transition-transform"
      aria-label="Cadastre sua loja no Mercado Fácil"
    >
      <img
        src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/02177928163662711300f35b2a874e35aceb4d35afb57b85ac48c_0.jpeg"
        alt="Mercado Fácil — cadastre sua loja"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/55 backdrop-blur-sm px-4 py-3">
        <p className="text-[#FFD1E7] text-xs font-bold uppercase tracking-wider">Mercado Fácil</p>
        <p className="text-white text-sm leading-snug">
          Cansado de pagar comissão pro iFood? Cadastre sua loja aqui 🛒
        </p>
      </div>
    </Link>
  );
};
