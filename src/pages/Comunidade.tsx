import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { PostForm } from "@/components/community/PostForm";
import { PostCard } from "@/components/community/PostCard";
import { Loader2, Users, MessageCircle } from "lucide-react";
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
      console.error("fetchPosts error:", error);
      toast({ title: "Erro ao carregar posts", description: error.message, variant: "destructive" });
    }
    setPosts((data as unknown as Post[]) || []);
    setLoading(false);
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id);
    setUserLikes(new Set((data || []).map((l) => l.post_id)));
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchUserLikes();
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
      <div className="min-h-screen bg-background pb-28 pt-[calc(env(safe-area-inset-top)+2.5rem)]">
        <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
          {/* Header */}
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg font-bold text-[#FD46A1]">Comunidade</h1>
            </div>
          </div>

          {/* Chat ao vivo */}
          <button
            onClick={() => navigate("/comunidade/chat")}
            className="w-full bg-[#FFD1E7] hover:bg-[#FFD1E7]/80 transition rounded-3xl shadow p-4 flex items-center gap-3 text-left"
          >
            <div className="bg-[#FD46A1] p-2.5 rounded-xl">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-base text-gray-800">Chat ao vivo</p>
              <p className="text-xs text-gray-600">Converse em tempo real com a comunidade</p>
            </div>
          </button>

        {/* Post Form */}
        <PostForm userId={user.id} onPostCreated={() => { fetchPosts(); }} />

        {/* Feed */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users size={48} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">Nenhuma publicação ainda</p>
            <p className="text-sm">Seja o primeiro a compartilhar!</p>
          </div>
        ) : (
          <div className="space-y-4">
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
    </>
  );
}
