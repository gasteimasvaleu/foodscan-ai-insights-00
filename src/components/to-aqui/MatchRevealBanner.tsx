import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { MessageCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  senderAlias: string;
  receiverAlias: string;
  fireConfetti?: boolean;
  venueId?: string;
  currentUserId?: string;
  messageSenderId?: string;
}

export default function MatchRevealBanner({
  senderAlias,
  receiverAlias,
  fireConfetti,
  venueId,
  currentUserId,
  messageSenderId,
}: Props) {
  const fired = useRef(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fireConfetti || fired.current) return;
    fired.current = true;
    const end = Date.now() + 1500;
    const colors = ["#FD46A1", "#FFD1E7", "#ffffff"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [fireConfetti]);

  const openDM = async () => {
    if (!venueId || !currentUserId) return;
    setLoading(true);
    // Busca o último guess correct do venue em que sou participante
    const { data, error } = await supabase
      .from("venue_guesses")
      .select("dm_conversation_id, sender_id, receiver_id")
      .eq("venue_id", venueId)
      .eq("status", "correct")
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order("resolved_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data?.dm_conversation_id) {
      // fallback: tenta criar/obter via RPC se souber o outro lado pelo sender da mensagem
      if (messageSenderId && messageSenderId !== currentUserId) {
        const { data: rpcId } = await supabase.rpc("get_or_create_dm_conversation", {
          _other_user: messageSenderId,
        });
        setLoading(false);
        if (rpcId) {
          navigate(`/comunidade/dm/${rpcId}`);
          return;
        }
      }
      setLoading(false);
      toast({ title: "Não foi possível abrir a conversa", variant: "destructive" });
      return;
    }
    setLoading(false);
    navigate(`/comunidade/dm/${data.dm_conversation_id}`);
  };

  const isParticipant =
    !!currentUserId && !!venueId && (messageSenderId === currentUserId || messageSenderId !== currentUserId);

  return (
    <div className="my-3 mx-auto max-w-xs">
      <div className="rounded-2xl bg-gradient-to-br from-[#FD46A1] to-[#FF8AC4] text-white p-4 shadow-lg text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-white/30 ring-4 ring-white/80 animate-pulse flex items-center justify-center font-bold text-lg">
            {senderAlias.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-2xl">💞</span>
          <div className="w-12 h-12 rounded-full bg-white/30 ring-4 ring-white/80 animate-pulse flex items-center justify-center font-bold text-lg">
            {receiverAlias.slice(0, 1).toUpperCase()}
          </div>
        </div>
        <p className="text-sm font-medium">
          <strong>{senderAlias}</strong> descobriu <strong>{receiverAlias}</strong>!
        </p>
        <p className="text-xs opacity-90 mt-1 mb-3">Uma conversa privada foi aberta entre vocês ✨</p>
        {isParticipant && (
          <button
            onClick={openDM}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white text-[#FD46A1] rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
            Abrir conversa
          </button>
        )}
      </div>
    </div>
  );
}
