import { useState } from "react";
import { Star, X, Bike } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useMFPendingRating } from "@/hooks/mercado-facil/useMFPendingRating";

export function MFRatingModal() {
  const { entrega, entregador, dismiss, submit } = useMFPendingRating();
  const [nota, setNota] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  const open = !!entrega && !!entregador;

  const handleClose = (v: boolean) => {
    if (!v) {
      dismiss();
      setNota(0);
      setComentario("");
    }
  };

  const handleSubmit = async () => {
    if (nota < 1) {
      toast({ title: "Escolha uma nota de 1 a 5", variant: "destructive" });
      return;
    }
    setEnviando(true);
    const res = await submit(nota, comentario);
    setEnviando(false);
    if (res.ok) {
      toast({ title: "Obrigado pela sua avaliação!" });
      setNota(0);
      setComentario("");
    } else {
      toast({ title: "Não foi possível enviar a avaliação", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="bg-white/70 backdrop-blur-md border-2 border-[#FD46A1] rounded-3xl p-5 max-w-sm w-[calc(100%-2rem)] mx-auto shadow-xl"
      >
        <button
          onClick={() => handleClose(false)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FD46A1] text-white flex items-center justify-center"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>

        {entregador && (
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-16 h-16 rounded-full bg-[#FFD1E7] overflow-hidden flex items-center justify-center mb-2">
              {entregador.foto_url ? (
                <img src={entregador.foto_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Bike size={24} className="text-[#FD46A1]" />
              )}
            </div>
            <p className="text-base text-foreground">Como foi sua entrega?</p>
            <p className="text-sm text-foreground/60">{entregador.nome_completo}</p>
          </div>
        )}

        <div className="flex justify-center gap-1.5 my-4">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = n <= (hover || nota);
            return (
              <button
                key={n}
                onClick={() => setNota(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                className="p-1"
                aria-label={`${n} estrelas`}
              >
                <Star
                  size={32}
                  className={active ? "fill-[#FD46A1] text-[#FD46A1]" : "text-foreground/30"}
                />
              </button>
            );
          })}
        </div>

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Conte como foi (opcional)"
          maxLength={300}
          rows={3}
          className="w-full rounded-2xl bg-white/70 border border-[#FD46A1]/30 p-3 text-base outline-none resize-none"
        />

        <div className="flex flex-col gap-2 mt-4">
          <Button
            onClick={handleSubmit}
            disabled={enviando || nota < 1}
            className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-2xl h-12 text-base text-white"
          >
            {enviando ? "Enviando..." : "Enviar avaliação"}
          </Button>
          <button
            onClick={() => handleClose(false)}
            className="text-xs text-foreground/60 hover:text-foreground/80"
          >
            Avaliar depois
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
