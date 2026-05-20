import { ChevronLeft, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMFCart } from "@/hooks/mercado-facil/useMFCart";

interface Props {
  title: string;
  showCart?: boolean;
  backTo?: string;
}

export const MFHeader = ({ title, showCart = true, backTo }: Props) => {
  const navigate = useNavigate();
  const { totalItens } = useMFCart();

  return (
    <header
      className="fixed top-0 inset-x-0 z-30 bg-[#FD46A1] text-white shadow-sm"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="h-14 flex items-center justify-between px-3">
        <button
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/15"
          aria-label="Voltar"
        >
          <ChevronLeft size={26} />
        </button>
        <h1 className="text-base font-semibold truncate flex-1 text-center px-2">{title}</h1>
        {showCart ? (
          <Link
            to="/mercado-facil/carrinho"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/15 relative"
            aria-label="Carrinho"
          >
            <ShoppingCart size={22} />
            {totalItens > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-white text-[#FD46A1] text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                {totalItens > 99 ? "99+" : totalItens}
              </span>
            )}
          </Link>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  );
};
