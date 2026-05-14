import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StoryItem {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  expires_at: string;
  profiles: { name: string; avatar_url: string | null } | null;
}

interface UserGroup {
  user_id: string;
  name: string;
  avatar_url: string | null;
  stories: StoryItem[];
  hasUnviewed: boolean;
}

interface Props {
  currentUserId: string;
  currentUserAvatar: string | null;
  currentUserName: string;
  onAddStory: () => void;
  onOpenStories: (groups: UserGroup[], startIndex: number) => void;
  refreshKey?: number;
}

export function StoriesCarousel({
  currentUserId,
  currentUserAvatar,
  currentUserName,
  onAddStory,
  onOpenStories,
  refreshKey,
}: Props) {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [myStories, setMyStories] = useState<StoryItem[]>([]);

  const fetch = async () => {
    const { data } = await supabase
      .from("community_stories")
      .select("*, profiles:user_id(name, avatar_url)")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    const stories = (data as unknown as StoryItem[]) || [];
    const { data: views } = await supabase
      .from("community_story_views")
      .select("story_id")
      .eq("viewer_id", currentUserId);
    const viewedIds = new Set((views || []).map((v) => v.story_id));

    // Group by user
    const map = new Map<string, UserGroup>();
    for (const s of stories) {
      let g = map.get(s.user_id);
      if (!g) {
        g = {
          user_id: s.user_id,
          name: s.profiles?.name || "Usuário",
          avatar_url: s.profiles?.avatar_url || null,
          stories: [],
          hasUnviewed: false,
        };
        map.set(s.user_id, g);
      }
      g.stories.push(s);
      if (!viewedIds.has(s.id) && s.user_id !== currentUserId) g.hasUnviewed = true;
    }

    const arr = Array.from(map.values());
    // Sort: unviewed first
    arr.sort((a, b) => Number(b.hasUnviewed) - Number(a.hasUnviewed));

    setMyStories(map.get(currentUserId)?.stories || []);
    // Remove me from main list (I show fixed left)
    setGroups(arr.filter((g) => g.user_id !== currentUserId));
  };

  useEffect(() => {
    fetch();
    const ch = supabase
      .channel("community_stories_carousel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_stories" },
        () => fetch()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, refreshKey]);

  const handleMyAvatarClick = () => {
    if (myStories.length === 0) {
      onAddStory();
    } else {
      const meGroup: UserGroup = {
        user_id: currentUserId,
        name: currentUserName,
        avatar_url: currentUserAvatar,
        stories: myStories,
        hasUnviewed: false,
      };
      onOpenStories([meGroup, ...groups], 0);
    }
  };

  return (
    <div className="bg-card rounded-2xl border overflow-hidden">
      <div className="flex items-stretch">
        {/* Fixed: me */}
        <div className="flex-shrink-0 px-3 py-3 border-r border-border/40">
          <div className="flex flex-col items-center gap-1.5 w-16">
            <div
              role="button"
              tabIndex={0}
              onClick={handleMyAvatarClick}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleMyAvatarClick(); }}
              className="relative cursor-pointer"
              aria-label="Seu story"
            >
              <div
                className={cn(
                  "p-[2px] rounded-full",
                  myStories.length > 0
                    ? "bg-gradient-to-tr from-[#FD46A1] via-orange-400 to-yellow-400"
                    : "bg-muted"
                )}
              >
                <div className="bg-background p-[2px] rounded-full">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-base font-bold text-primary">
                    {currentUserAvatar ? (
                      <img src={currentUserAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      currentUserName.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddStory();
                }}
                aria-label="Adicionar story"
                className="absolute -bottom-1 -right-1 bg-[#FD46A1] rounded-full p-1.5 border-2 border-background hover:bg-[#FD46A1]/90"
              >
                <Plus size={12} className="text-white" strokeWidth={3} />
              </button>
            </div>
            <span className="text-[11px] text-foreground truncate w-full text-center">Seu story</span>
            </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="flex gap-3 px-3 py-3">
            {groups.length === 0 && (
              <div className="flex items-center text-xs text-muted-foreground px-2">
                Nenhum story ainda. Seja o primeiro!
              </div>
            )}
            {groups.map((g, i) => (
              <button
                key={g.user_id}
                onClick={() =>
                  onOpenStories(
                    myStories.length > 0
                      ? [
                          {
                            user_id: currentUserId,
                            name: currentUserName,
                            avatar_url: currentUserAvatar,
                            stories: myStories,
                            hasUnviewed: false,
                          },
                          ...groups,
                        ]
                      : groups,
                    myStories.length > 0 ? i + 1 : i
                  )
                }
                className="flex flex-col items-center gap-1.5 w-16 flex-shrink-0"
              >
                <div
                  className={cn(
                    "p-[2px] rounded-full",
                    g.hasUnviewed
                      ? "bg-gradient-to-tr from-[#FD46A1] via-orange-400 to-yellow-400"
                      : "bg-muted"
                  )}
                >
                  <div className="bg-background p-[2px] rounded-full">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-base font-bold text-primary">
                      {g.avatar_url ? (
                        <img src={g.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        g.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-foreground truncate w-full text-center">{g.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
