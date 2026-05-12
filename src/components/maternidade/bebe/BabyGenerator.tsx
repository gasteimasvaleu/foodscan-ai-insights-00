import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Upload, Download, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function BabyGenerator() {
  const { user } = useAuth();
  const [mother, setMother] = useState<string | null>(null);
  const [father, setFather] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('baby-generator').upload(path, file, { upsert: false });
    if (error) { toast.error('Erro ao enviar foto'); return null; }
    const { data } = await supabase.storage.from('baby-generator').createSignedUrl(path, 60 * 10);
    return data?.signedUrl || null;
  };

  const generate = async () => {
    if (!mother || !father) { toast.error('Envie ambas as fotos'); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-baby', {
        body: { motherImage: mother, fatherImage: father },
      });
      if (error) {
        toast.error(error.message || 'Erro ao gerar bebê');
        return;
      }
      if (data?.error) { toast.error(data.error); return; }
      if (data?.imageUrl) {
        setResult(data.imageUrl);
        toast.success('Bebê gerado!');
      } else {
        toast.error('Não foi possível gerar a imagem');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao gerar bebê');
    } finally { setLoading(false); }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = `bebe-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Como será o bebê?</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            Envie uma foto da mãe e do pai e veja uma simulação criativa do bebê.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <PhotoSlot label="Mãe" url={mother} onChange={setMother} upload={upload} />
            <PhotoSlot label="Pai" url={father} onChange={setFather} upload={upload} />
          </div>
          <Button onClick={generate} disabled={loading || !mother || !father}
            className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white h-12 rounded-xl">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Gerar bebê
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Resultado lúdico gerado por IA, apenas para diversão. Não é uma previsão real.
          </p>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-none bg-[#FFD1E7] rounded-3xl">
          <CardHeader className="pb-2"><CardTitle className="text-base text-gray-800 font-semibold">Resultado</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <img src={result} alt="Bebê gerado" className="w-full rounded-2xl" />
            <Button onClick={download} variant="outline" className="w-full rounded-xl">
              <Download className="h-4 w-4 mr-2" />Baixar
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PhotoSlot({ label, url, onChange, upload }: {
  label: string; url: string | null;
  onChange: (u: string | null) => void;
  upload: (f: File) => Promise<string | null>;
}) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const onFile = async (f: File) => {
    setBusy(true);
    const u = await upload(f);
    setBusy(false);
    if (u) onChange(u);
  };

  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-700 text-center">{label}</p>
      <div className="aspect-square bg-white/60 rounded-2xl border-2 border-dashed border-[#FD46A1]/40 relative overflow-hidden flex items-center justify-center">
        {url ? (
          <>
            <img src={url} alt={label} className="w-full h-full object-cover" />
            <button onClick={() => onChange(null)} className="absolute top-1 right-1 bg-[#FD46A1] text-white rounded-full p-1">
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <button onClick={() => ref.current?.click()} disabled={busy}
            className="flex flex-col items-center gap-1 text-gray-500 p-2">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            <span className="text-xs">Enviar foto</span>
          </button>
        )}
        <input ref={ref} type="file" accept="image/*" hidden
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </div>
    </div>
  );
}
