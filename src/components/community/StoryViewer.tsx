import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface StoryItem {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  media_type?: "image" | "video" | null;
  video_url?: string | null;
  video_poster_url?: string | null;
  video_duration_seconds?: number | null;
}

export interface UserGroup {
  user_id: string;
  name: string;
  avatar_url: string | null;
  stories: StoryItem[];
}

interface Props {
  groups: UserGroup[];
  startIndex: number;
  currentUserId: string;
  onClose: () => void;
}

const IMAGE_DURATION = 5000;

export function StoryViewer({ groups, startIndex, currentUserId, onClose }: Props) {
  const navigate = useNavigate();
  const [groupIdx, setGroupIdx] = useState(startIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");
  const startedAt = useRef(Date.now());
  const accumulated = useRef(0); // for pause/resume
  const videoRef = useRef<HTMLVideoElement>(null);

  const group = groups[groupIdx];
  const story = group?.stories[storyIdx];
  const isVideo = story?.media_type === "video" && !!story.video_url;

  // Mark as viewed
  useEffect(() => {
    if (!story) return;
    if (story.user_id !== currentUserId) {
      supabase
        .from("community_story_views")
        .insert({ story_id: story.id, viewer_id: currentUserId })
        .then(() => {});
    }
  }, [story?.id, currentUserId, story]);

  // Reset progress on story change
  useEffect(() => {
    setProgress(0);
    accumulated.current = 0;
    startedAt.current = Date.now();
  }, [groupIdx, storyIdx]);

  // Image progress timer (videos use timeupdate)
  useEffect(() => {
    if (isVideo || !story) return;
    if (paused) return;
    startedAt.current = Date.now();
    const id = setInterval(() => {
      const elapsed = accumulated.current + (Date.now() - startedAt.current);
      const p = Math.min(1, elapsed / IMAGE_DURATION);
      setProgress(p);
      if (p >= 1) {
        clearInterval(id);
        next();
      }
    }, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIdx, storyIdx, paused, isVideo]);

  // Track pause/resume for image timer
  useEffect(() => {
    if (isVideo) return;
    if (paused) {
      accumulated.current += Date.now() - startedAt.current;
    } else {
      startedAt.current = Date.now();
    }
  }, [paused, isVideo]);

  // Video pause/play sync
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, story?.id]);

  const next = () => {
    if (!group) return;
    if (storyIdx < group.stories.length - 1) {
      setStoryIdx(storyIdx + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx(groupIdx + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (storyIdx > 0) setStoryIdx(storyIdx - 1);
    else if (groupIdx > 0) {
      const newIdx = groupIdx - 1;
      setGroupIdx(newIdx);
      setStoryIdx(groups[newIdx].stories.length - 1);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !group) return;
    try {
      const { data: convId, error } = await supabase.rpc("get_or_create_dm_conversation", {
        _other_user: group.user_id,
      });
      if (error) throw error;
      await supabase.from("dm_messages").insert({
        conversation_id: convId as string,
        sender_id: currentUserId,
        content: `↩️ Resposta ao story: ${reply.trim()}`,
      });
      setReply("");
      onClose();
      navigate(`/comunidade/dm/${convId}`);
    } catch (e: any) {
      toast({ title: "Erro ao enviar", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!story || story.user_id !== currentUserId) return;
    if (!confirm("Apagar este story?")) return;
    await supabase.from("community_stories").delete().eq("id", story.id);
    toast({ title: "Story removido" });
    onClose();
  };

  if (!group || !story) return null;
  const isMine = story.user_id === currentUserId;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Progress bars */}
      <div className="flex gap-1 p-2 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
        {group.stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-[width] duration-100"
              style={{
                width: `${i < storyIdx ? 100 : i === storyIdx ? progress * 100 : 0}%`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 text-white">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {group.avatar_url ? (
            <img src={group.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            group.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{group.name}</p>
          <p className="text-xs text-white/70">
            {formatDistanceToNow(new Date(story.created_at), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
        {isMine && (
          <button onClick={handleDelete} className="p-2 text-white/80 hover:text-white" aria-label="Apagar">
            <Trash2 size={18} />
          </button>
        )}
        <button onClick={onClose} className="p-2 text-white" aria-label="Fechar">
          <X size={22} />
        </button>
      </div>

      {/* Media */}
      <div
        className="flex-1 relative flex items-center justify-center select-none"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerCancel={() => setPaused(false)}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            key={story.id}
            src={story.video_url || undefined}
            poster={story.video_poster_url || story.image_url}
            autoPlay
            playsInline
            muted={false}
            preload="auto"
            className="max-h-full max-w-full object-contain"
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration > 0) setProgress(Math.min(1, v.currentTime / v.duration));
            }}
            onEnded={next}
          />
        ) : (
          <img src={story.image_url} alt="" className="max-h-full max-w-full object-contain" />
        )}

        {/* Tap zones */}
        <button
          onClick={prev}
          className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-start pl-2 text-white/0 hover:text-white/40 transition"
          aria-label="Anterior"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-2 text-white/0 hover:text-white/40 transition"
          aria-label="Próximo"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Reply (only for others) */}
      {!isMine && (
        <div className="p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] flex gap-2 items-center bg-black">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            placeholder={`Responder a ${group.name}...`}
            className="flex-1 bg-white/10 text-white placeholder:text-white/50 rounded-full px-4 py-2.5 text-base outline-none border border-white/20 focus:border-white/50"
          />
          <button
            onClick={handleReply}
            disabled={!reply.trim()}
            className="bg-[#FD46A1] disabled:opacity-40 text-white p-2.5 rounded-full"
            aria-label="Enviar"
          >
            <Send size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
