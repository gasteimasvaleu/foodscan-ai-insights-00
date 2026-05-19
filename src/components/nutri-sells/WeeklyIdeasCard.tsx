import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Idea {
  title: string;
  hook: string;
  post_type: string;
}

interface Props {
  audience?: string;
  onPick: (idea: Idea) => void;
}

export const WeeklyIdeasCard = ({ audience, onPick }: Props) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-weekly-ideas", {
        body: { audience },
      });
      if (error) throw error;
      setIdeas(Array.isArray(data?.ideas) ? data.ideas : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0] pl-5 pr-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base text-foreground">Ideias da semana</h2>
        <Button
          variant="ghost" size="sm"
          onClick={fetchIdeas}
          disabled={loading}
          className="text-[#FD46A1]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        </Button>
      </div>
      {loading && !ideas.length ? (
        <p className="text-sm text-muted-foreground">Gerando sugestões…</p>
      ) : (
        <div className="space-y-2">
          {ideas.map((idea, i) => (
            <button
              key={i}
              onClick={() => onPick(idea)}
              className="w-full text-left rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-3 hover:bg-[#FFD1E7]/60 transition-colors"
            >
              <p className="text-sm text-foreground">{idea.title}</p>
              <p className="text-xs text-muted-foreground">{idea.hook}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
