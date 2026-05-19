import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  venueId: string;
  senderId: string;
  receiverId: string;
  receiverDisplayName: string;
}

export default function GuessIdentityDialog({
  open,
  onClose,
  venueId,
  senderId,
  receiverId,
  receiverDisplayName,
}: Props) {
  const [guess, setGuess] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const text = guess.trim();
    if (text.length < 1 || text.length > 40) {
      toast({
        title: "Palpite inválido",
        description: "Entre 1 e 40 caracteres.",
        variant: "destructive",
      });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("venue_guesses").insert({
      venue_id: venueId,
      sender_id: senderId,
      receiver_id: receiverId,
      guess_text: text,
    });
    setSending(false);
    if (error) {
      const msg = error.message || "";
      let friendly = "Não foi possível enviar o palpite";
      if (msg.includes("cooldown")) friendly = "Aguarde 5 minutos antes de tentar de novo com essa pessoa.";
      else if (msg.includes("rate_limit")) friendly = "Limite de 20 palpites por hora atingido.";
      else if (msg.includes("blocked_word")) friendly = "O palpite contém termos não permitidos.";
      else if (msg.includes("blocked_content")) friendly = "Links, telefones e emails não são permitidos.";
      toast({ title: "Erro", description: friendly, variant: "destructive" });
      return;
    }
    toast({
      title: "🕵️ Palpite enviado!",
      description: "Se a pessoa confirmar, vocês se descobrem e vira match.",
    });
    setGuess("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && (setGuess(""), onClose())}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white/80 backdrop-blur-md border-2 border-primary shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-[#FD46A1] flex items-center gap-2">
            <Search className="w-5 h-5" /> Já sei quem é você
          </DialogTitle>
          <DialogDescription>
            Escreva o nome (ou apelido) que você acha que é de <strong>{receiverDisplayName}</strong>. Ele(a)
            vai confirmar se acertou. Só se acertar vira match.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            maxLength={40}
            placeholder="Ex.: Mariana, João..."
            className="text-base"
            autoFocus
          />
          <p className="text-xs text-gray-500">
            Cooldown de 5 min entre tentativas com a mesma pessoa.
          </p>
          <Button
            onClick={submit}
            disabled={sending || guess.trim().length < 1}
            className="w-full rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar palpite"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
