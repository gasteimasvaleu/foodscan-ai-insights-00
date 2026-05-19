import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    emoji: "👤",
    title: "Toque no avatar",
    desc: "Clique no avatar ou nome de qualquer pessoa do chat pra abrir as ações disponíveis.",
  },
  {
    emoji: "💘🍹🪑💸",
    title: "Envie uma interação discreta",
    desc: "Mande uma paquera, ofereça um drink, convide pra mesa ou pague a conta — sem precisar escrever nada.",
  },
  {
    emoji: "✨",
    title: "Match abre uma conversa",
    desc: "Quando a outra pessoa retribuir a mesma ação, vocês dão match e uma DM privada é criada automaticamente.",
  },
];

export default function VenueChatOnboardingModal({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md bg-white/80 backdrop-blur-md rounded-3xl border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-[#FD46A1] text-xl text-center">
            Como funciona o chat do local
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Aqui rola um papo aberto + interações sutis com quem está no mesmo lugar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="flex gap-3 items-start bg-[#FFD1E7]/60 rounded-2xl p-3"
            >
              <div className="text-2xl shrink-0">{s.emoji}</div>
              <div className="min-w-0">
                <p className="text-base text-gray-900">{s.title}</p>
                <p className="text-sm text-gray-600 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center mt-2 px-2">
          Respeite quem disser não. Comportamentos abusivos resultam em banimento.
        </p>

        <Button
          onClick={onClose}
          className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 rounded-full h-11 mt-2"
        >
          Entendi
        </Button>
      </DialogContent>
    </Dialog>
  );
}
