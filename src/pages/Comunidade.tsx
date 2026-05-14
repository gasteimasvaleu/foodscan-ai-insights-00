import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { PostCard } from "@/components/community/PostCard";
import { StoriesCarousel } from "@/components/community/StoriesCarousel";
import { StoryViewer, UserGroup } from "@/components/community/StoryViewer";
import { CreateStoryModal } from "@/components/community/CreateStoryModal";
import { CreatePostModal } from "@/components/community/CreatePostModal";
import { MyPostsGrid } from "@/components/community/MyPostsGrid";
import { PostDetailModal } from "@/components/community/PostDetailModal";
import { Loader2, Send, Plus, Users, LayoutGrid } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Post {
  id: string;
  description: string;
  before_photo_url: string | null;
  after_photo_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles: { name: string; avatar_url: string | null } | null;
}

export default function Comunidade() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ name: string; avatar_url: string | null } | null>(null);
  const [unreadDM, setUnreadDM] = useState(0);

  // Story viewer state
  const [viewerGroups, setViewerGroups] = useState<UserGroup[] | null>(null);
  const [viewerStart, setViewerStart] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [storiesRefresh, setStoriesRefresh] = useState(0);
  const [view, setView] = useState<"feed" | "grid">("feed");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("community_posts")
      .select("*, profiles:user_id(name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      toast({ title: "Erro ao carregar posts", description: error.message, variant: "destructive" });
    }
    setPosts((data as unknown as Post[]) || []);
    setLoading(false);
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    const { data } = await supabase.from("post_likes").select("post_id").eq("user_id", user.id);
    setUserLikes(new Set((data || []).map((l) => l.post_id)));
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    setProfile(data || { name: user.email || "Usuário", avatar_url: null });
  };

  const fetchUnreadDM = async () => {
    if (!user) return;
    const { count } = await supabase
      .from("dm_messages")
      .select("id", { count: "exact", head: true })
      .neq("sender_id", user.id)
      .is("read_at", null);
    setUnreadDM(count || 0);
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchUserLikes();
      fetchProfile();
      fetchUnreadDM();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pb-44 pt-[calc(env(safe-area-inset-top)+2.5rem)]">
        <div className="max-w-lg mx-auto px-3 pt-4 space-y-3">
          {/* Header */}
          <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg font-bold text-primary flex-1">Comunidade</h1>
              <button
                onClick={() => setView((v) => (v === "grid" ? "feed" : "grid"))}
                className={`p-2 rounded-full ${view === "grid" ? "bg-[#FD46A1] text-white" : "text-foreground"}`}
                aria-label={view === "grid" ? "Ver feed" : "Ver minhas publicações em grade"}
                aria-pressed={view === "grid"}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => navigate("/comunidade/dm")}
                className="relative p-2 text-foreground"
                aria-label="Mensagens diretas"
              >
                <Send size={22} />
                {unreadDM > 0 && (
                  <span className="absolute top-0 right-0 bg-[#FD46A1] text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 font-bold">
                    {unreadDM > 9 ? "9+" : unreadDM}
                  </span>
                )}
              </button>
            </div>
          </div>

          {view === "feed" && (
            <StoriesCarousel
              currentUserId={user.id}
              currentUserAvatar={profile?.avatar_url || null}
              currentUserName={profile?.name || "Você"}
              onAddStory={() => setStoryOpen(true)}
              onOpenStories={(groups, idx) => {
                setViewerGroups(groups);
                setViewerStart(idx);
              }}
              refreshKey={storiesRefresh}
            />
          )}

          {view === "grid" ? (
            <MyPostsGrid
              userId={user.id}
              onOpenPost={(id) => setSelectedPostId(id)}
              refreshKey={storiesRefresh}
            />
          ) : loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-medium">Nenhuma publicação ainda</p>
              <p className="text-sm">Seja o primeiro a compartilhar!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  userId={user.id}
                  userLiked={userLikes.has(post.id)}
                  onLikeToggle={fetchUserLikes}
                  onPostDeleted={fetchPosts}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating + button */}
      <button
        onClick={() => setPostOpen(true)}
        className="fixed right-4 bottom-28 z-40 bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-full p-4 shadow-lg shadow-[#FD46A1]/30"
        aria-label="Nova publicação"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {viewerGroups && (
        <StoryViewer
          groups={viewerGroups}
          startIndex={viewerStart}
          currentUserId={user.id}
          onClose={() => {
            setViewerGroups(null);
            setStoriesRefresh((k) => k + 1);
          }}
        />
      )}

      <CreateStoryModal
        open={storyOpen}
        onOpenChange={setStoryOpen}
        userId={user.id}
        onCreated={() => setStoriesRefresh((k) => k + 1)}
      />

      <CreatePostModal
        open={postOpen}
        onOpenChange={setPostOpen}
        userId={user.id}
        onCreated={fetchPosts}
      />

      <PostDetailModal
        postId={selectedPostId}
        userId={user.id}
        onClose={() => setSelectedPostId(null)}
        onChanged={() => {
          fetchPosts();
          fetchUserLikes();
        }}
      />
    </>
  );
}
