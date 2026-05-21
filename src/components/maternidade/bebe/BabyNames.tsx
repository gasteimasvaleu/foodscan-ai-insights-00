import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SectionPicker } from '@/components/maternidade/SectionPicker';
import { Heart, Loader2, Search, Sparkles, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Suggestion = { name: string; meaning: string; origin: string; gender: string };
type SearchResult = Suggestion & { variations?: string[]; funFacts?: string; found: boolean };
type Favorite = { id: string; name: string; meaning: string | null; origin: string | null; gender: string | null };

export function BabyNames() {
  const { user } = useAuth();
  const [tab, setTab] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gender, setGender] = useState('any');
  const [letter, setLetter] = useState('any');
  const [origin, setOrigin] = useState('any');
  const [length, setLength] = useState('any');
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const loadFavorites = async () => {
    if (!user) return;
    const { data } = await supabase.from('baby_favorite_names')
      .select('id, name, meaning, origin, gender')
      .eq('user_id', user.id).order('created_at', { ascending: false });
    setFavorites((data as Favorite[]) || []);
  };

  useEffect(() => { loadFavorites(); }, [user]);

  const generate = async () => {
    setLoading(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-baby-names', {
        body: { mode: 'generate', gender, initialLetter: letter, origin, length },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setSuggestions(data?.names || []);
    } catch {
      toast.error('Erro ao gerar nomes');
    } finally { setLoading(false); }
  };

  const search = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearchResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-baby-names', {
        body: { mode: 'search', searchQuery: searchQuery.trim() },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setSearchResult(data?.result || null);
    } catch {
      toast.error('Erro ao buscar nome');
    } finally { setLoading(false); }
  };

  const favorite = async (s: Suggestion | SearchResult) => {
    if (!user) return;
    const exists = favorites.find((f) => f.name.toLowerCase() === s.name.toLowerCase());
    if (exists) { toast.info('Já está nos favoritos'); return; }
    const { error } = await supabase.from('baby_favorite_names').insert({
      user_id: user.id, name: s.name, meaning: s.meaning, origin: s.origin, gender: s.gender,
    });
    if (error) { toast.error('Erro ao favoritar'); return; }
    toast.success('Favoritado');
    loadFavorites();
  };

  const removeFavorite = async (id: string) => {
    const { error } = await supabase.from('baby_favorite_names').delete().eq('id', id);
    if (error) { toast.error('Erro ao remover'); return; }
    setFavorites(favorites.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]">
        <CardHeader className="pl-5 pb-2"><CardTitle className="text-base font-semibold">Nomes de bebê</CardTitle></CardHeader>
        <CardContent className="pl-5">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full bg-white/50 rounded-xl">
              <TabsTrigger value="generate" className="rounded-xl data-[state=active]:bg-[#FD46A1] data-[state=active]:text-white">Sugerir</TabsTrigger>
              <TabsTrigger value="search" className="rounded-xl data-[state=active]:bg-[#FD46A1] data-[state=active]:text-white">Buscar</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gênero" value={gender} onChange={setGender} options={[
                  ['any','Qualquer'],['male','Masculino'],['female','Feminino'],['unisex','Unissex'],
                ]} />
                <Field label="Letra inicial" value={letter} onChange={setLetter} options={[
                  ['any','Qualquer'],...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => [l,l] as [string,string]),
                ]} />
                <Field label="Origem" value={origin} onChange={setOrigin} options={[
                  ['any','Qualquer'],['hebraica','Hebraica'],['grega','Grega'],['latina','Latina'],
                  ['árabe','Árabe'],['celta','Celta'],['germânica','Germânica'],['indígena','Indígena'],['africana','Africana'],
                ]} />
                <Field label="Tamanho" value={length} onChange={setLength} options={[
                  ['any','Qualquer'],['short','Curto'],['medium','Médio'],['long','Longo'],
                ]} />
              </div>
              <Button onClick={generate} disabled={loading} className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white h-12 rounded-xl">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Sugerir nomes
              </Button>
              {suggestions.map((s, i) => (
                <NameCard key={i} item={s} onFav={() => favorite(s)} />
              ))}
            </TabsContent>

            <TabsContent value="search" className="space-y-3 mt-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Nome</Label>
                <div className="flex gap-2">
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && search()}
                    placeholder="Digite um nome" className="text-base h-12 rounded-xl flex-1" />
                  <Button onClick={search} disabled={loading} className="bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white h-12 px-4 rounded-xl">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {searchResult && (
                searchResult.found ? (
                  <div className="space-y-2">
                    <NameCard item={searchResult} onFav={() => favorite(searchResult)} />
                    {searchResult.variations && searchResult.variations.length > 0 && (
                      <div className="bg-white/60 rounded-xl p-3">
                        <p className="text-sm text-gray-800 mb-1">Variações</p>
                        <p className="text-sm text-gray-600">{searchResult.variations.join(', ')}</p>
                      </div>
                    )}
                    {searchResult.funFacts && (
                      <div className="bg-white/60 rounded-xl p-3">
                        <p className="text-sm text-gray-800 mb-1">Curiosidades</p>
                        <p className="text-sm text-gray-600">{searchResult.funFacts}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Nome não encontrado.</p>
                )
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {favorites.length > 0 && (
        <Card className="border-none bg-[#FFD1E7] rounded-3xl">
          <CardHeader className="pb-2"><CardTitle className="text-base text-gray-800 font-semibold">Favoritos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {favorites.map((f) => (
              <div key={f.id} className="bg-white/60 rounded-xl px-3 py-2 flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{f.name}</p>
                  {f.meaning && <p className="text-xs text-gray-600">{f.meaning}</p>}
                </div>
                <button onClick={() => removeFavorite(f.id)} className="text-gray-400 hover:text-[#FD46A1]">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-gray-500 text-center px-4">
        Conteúdo gerado por IA, apenas como referência inspiracional.
      </p>
    </div>
  );
}

function Field({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-gray-700">{label}</Label>
      <SectionPicker
        title={label}
        value={value}
        onChange={onChange}
        options={options.map(([v, l]) => ({ id: v, label: l }))}
      />
    </div>
  );
}


function NameCard({ item, onFav }: { item: Suggestion | SearchResult; onFav: () => void }) {
  return (
    <div className="bg-white/60 rounded-xl p-3 flex items-start gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-base text-gray-900">{item.name}</p>
          <span className="text-xs text-[#FD46A1]">{item.gender === 'male' ? 'masc.' : item.gender === 'female' ? 'fem.' : 'unissex'}</span>
        </div>
        {item.origin && <p className="text-xs text-gray-600">Origem: {item.origin}</p>}
        {item.meaning && <p className="text-sm text-gray-700 mt-1">{item.meaning}</p>}
      </div>
      <button onClick={onFav} className="text-[#FD46A1] p-1">
        <Heart className="h-5 w-5" />
      </button>
    </div>
  );
}
