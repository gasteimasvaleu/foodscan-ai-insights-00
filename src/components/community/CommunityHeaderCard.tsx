import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutGrid, Send, Camera, Heart, Users } from "lucide-react";

interface Props {
  userId: string;
  userName: string;
  userAvatar: string | null;
  view: "feed" | "grid";
  onToggleView: () => void;
  unreadDM: number;
  onOpenDM: () => void;
}

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));

export function CommunityHeaderCard({
  userId, userName, userAvatar, view, onToggleView, unreadDM, onOpenDM,
}: Props) {
  const [stats, setStats] = useState({ posts: 0, likes: 0, members: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [mineRes, allRes] = await Promise.all([
        supabase.from("community_posts").select("likes_count").eq("user_id", userId),
        supabase.from("community_posts").select("user_id"),
      ]);
      if (cancelled) return;
      const mine = mineRes.data || [];
      const all = allRes.data || [];
      const members = new Set(all.map((p: any) => p.user_id)).size;
      const likes = mine.reduce((s: number, p: any) => s + (p.likes_count || 0), 0);
      setStats({ posts: mine.length, likes, members });
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div className="rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 shadow-xl animate-fade-in">
      {/* Cover */}
      <div className="relative aspect-[3/1] w-full bg-gradient-to-br from-[#FD46A1] to-[#FF8FC4]">
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={onToggleView}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition ${
              view === "grid" ? "bg-[#FD46A1] text-white" : "bg-black/40 text-white hover:bg-black/55"
            }`}
            aria-label={view === "grid" ? "Ver feed" : "Ver minhas publicações em grade"}
            aria-pressed={view === "grid"}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={onOpenDM}
            className="relative w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/55 transition"
            aria-label="Mensagens diretas"
          >
            <Send size={18} />
            {unreadDM > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FD46A1] text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 font-bold border-2 border-white">
                {unreadDM > 9 ? "9+" : unreadDM}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-5">
        <div className="-mt-12 mb-3">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={userAvatar || ""} />
            <AvatarFallback className="bg-[#FFD1E7] text-[#FD46A1] text-2xl">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <h1 className="text-xl text-foreground truncate">Olá, {userName.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Comunidade We Diet</p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <StatChip icon={Camera} label="Publiquei" value={fmt(stats.posts)} />
          <StatChip icon={Heart} label="Curtidas" value={fmt(stats.likes)} />
          <StatChip icon={Users} label="Membros" value={fmt(stats.members)} />
        </div>
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-[#FFD1E7]/60 rounded-2xl py-3 px-2 flex flex-col items-center justify-center text-center">
      <Icon className="w-4 h-4 text-[#FD46A1] mb-1" />
      <p className="text-base text-foreground leading-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}
