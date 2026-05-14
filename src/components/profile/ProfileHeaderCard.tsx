import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit2, Camera, Crown, MapPin, Flame, Award, CalendarDays } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { EditProfileDialog } from "./EditProfileDialog";

interface ProfileData {
  id: string;
  name: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  email_public: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

interface Props {
  profile: ProfileData;
  email: string;
  isPro: boolean;
  onProfileUpdate: (updates: Partial<ProfileData>) => void;
}

export function ProfileHeaderCard({ profile, email, isPro, onProfileUpdate }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);
  const [streak, setStreak] = useState(0);
  const [badgesCount, setBadgesCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [streakRes, badgesRes] = await Promise.all([
        supabase.from("user_streaks").select("current_streak").eq("user_id", profile.id).maybeSingle(),
        supabase.from("user_badges").select("badge_id", { count: "exact", head: true }).eq("user_id", profile.id),
      ]);
      if (cancelled) return;
      setStreak(streakRes.data?.current_streak ?? 0);
      setBadgesCount(badgesRes.count ?? 0);
    })();
    return () => { cancelled = true; };
  }, [profile.id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, kind: "avatar" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(kind);
    try {
      const ext = file.name.split(".").pop();
      const path = `${profile.id}/${kind}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const column = kind === "avatar" ? "avatar_url" : "cover_url";
      const { error: updErr } = await supabase.from("profiles").update({ [column]: publicUrl }).eq("id", profile.id);
      if (updErr) throw updErr;
      onProfileUpdate({ [column]: publicUrl } as Partial<ProfileData>);
      toast({ title: kind === "avatar" ? "Foto atualizada!" : "Capa atualizada!" });
    } catch (err: any) {
      toast({ title: "Erro no upload", description: err?.message, variant: "destructive" });
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  const memberSince = new Date(profile.created_at).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
  const location = [profile.city, profile.state].filter(Boolean).join(", ");

  return (
    <>
      <div className="mb-8 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 shadow-xl">
        {/* Cover */}
        <div className="relative aspect-[3/1] w-full bg-gradient-to-br from-[#FD46A1] to-[#FF8FC4]">
          {profile.cover_url && (
            <img src={profile.cover_url} alt="Capa" className="w-full h-full object-cover" />
          )}
          <label className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-black/60 transition">
            <Camera className="w-4 h-4 text-white" />
            <input type="file" accept="image/*" className="hidden"
              disabled={uploading === "cover"}
              onChange={(e) => handleUpload(e, "cover")} />
          </label>
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          {/* Avatar overlay */}
          <div className="flex items-end justify-between -mt-14 mb-3">
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="bg-[#FFD1E7] text-[#FD46A1] text-3xl">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FD46A1] flex items-center justify-center cursor-pointer border-2 border-white shadow-md">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden"
                  disabled={uploading === "avatar"}
                  onChange={(e) => handleUpload(e, "avatar")} />
              </label>
              {isPro && (
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-[#FD46A1] to-[#FF8FC4] flex items-center justify-center border-2 border-white shadow-md">
                  <Crown className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}
              className="rounded-full border-[#FD46A1]/30 text-[#FD46A1] hover:bg-[#FFD1E7]/40 hover:text-[#FD46A1]">
              <Edit2 className="w-4 h-4 mr-1.5" />
              Editar
            </Button>
          </div>

          {/* Name + email */}
          <h2 className="text-xl text-foreground truncate">{profile.name}</h2>
          <p className="text-sm text-muted-foreground truncate">{profile.email_public || email}</p>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{profile.bio}</p>
          )}

          {/* Stats chips */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <StatChip icon={Flame} label="Sequência" value={`${streak}d`} />
            <StatChip icon={Award} label="Conquistas" value={String(badgesCount)} />
            <StatChip icon={CalendarDays} label="Membro" value={memberSince} />
          </div>
        </div>
      </div>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        userId={profile.id}
        initial={{
          name: profile.name,
          bio: profile.bio,
          email_public: profile.email_public,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
        }}
        onSaved={(updated) => onProfileUpdate(updated)}
      />
    </>
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
