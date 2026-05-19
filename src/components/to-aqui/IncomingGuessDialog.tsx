import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface IncomingGuess {
  id: string;
  guess_text: string;
  senderDisplayName: string;
}

interface Props {
  guess: IncomingGuess | null;
  onClose: () => void;
}

export default function IncomingGuessDialog({ guess, onClose }: Props) {
  const [resolving, setResolving] = useState<"correct" | "wrong" | null>(null);

  const resolve = async (status: "correct" | "wrong") => {
    if (!guess) return;
    setResolving(status);
    const { error } = await supabase
      .from("venue_guesses")
      .update({ status })
      .eq("id", guess.id);
    setResolving(null);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    if (status === "correct") {
      toast({
        title: "🎉 Vocês se descobriram!",
        description: "Uma conversa privada foi aberta.",
      });
    } else {
      toast({ title: "😅 Você marcou como errado", description: "Ninguém saberá o quê foi chutado." });
    }
    onClose();
  };

  return (
    <Dialog open={!!guess} onOpenChange={(o) => !o && !resolving && onClose()}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white/80 backdrop-blur-md border-2 border-primary shadow-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-[#FD46A1]">🕵️ Alguém acha que sabe quem é você</DialogTitle>
          <DialogDescription>
            <strong>{guess?.senderDisplayName}</strong> chutou:
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <div className="bg-[#FFD1E7] rounded-2xl p-4 text-center">
            <p className="text-xl text-gray-900 break-words">"{guess?.guess_text}"</p>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Se acertar, abre uma DM e aparece no chat (sem revelar seu nome real). Se errar, nada acontece.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => resolve("wrong")}
            disabled={!!resolving}
            className="flex-1 rounded-full border-gray-300"
          >
            {resolving === "wrong" ? <Loader2 className="w-4 h-4 animate-spin" /> : "😅 Errou"}
          </Button>
          <Button
            onClick={() => resolve("correct")}
            disabled={!!resolving}
            className="flex-1 rounded-full bg-[#FD46A1] hover:bg-[#FD46A1]/90"
          >
            {resolving === "correct" ? <Loader2 className="w-4 h-4 animate-spin" /> : "✅ Acertou!"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
