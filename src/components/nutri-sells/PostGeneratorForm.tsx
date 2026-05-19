import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";

export interface PostFormValues {
  post_type: string;
  theme: string;
  tone: string;
  audience: string;
}

const POST_TYPES = [
  { value: "carrossel", label: "Carrossel educativo" },
  { value: "dica", label: "Dica rápida" },
  { value: "receita", label: "Receita" },
  { value: "antes_depois", label: "Antes e depois" },
  { value: "story", label: "Story" },
  { value: "reel", label: "Roteiro de Reel" },
];
const TONES = ["Profissional", "Descontraído", "Motivacional", "Acolhedor", "Direto"];
const AUDIENCES = [
  "Emagrecimento",
  "Hipertrofia",
  "Saúde geral",
  "Gestantes e puérperas",
  "Diabéticos",
  "Idosos",
  "Crianças",
  "Atletas",
];

interface Props {
  initial?: Partial<PostFormValues>;
  loading?: boolean;
  onSubmit: (values: PostFormValues) => void;
}

export const PostGeneratorForm = ({ initial, loading, onSubmit }: Props) => {
  const [values, setValues] = useState<PostFormValues>({
    post_type: initial?.post_type || "dica",
    theme: initial?.theme || "",
    tone: initial?.tone || "Profissional",
    audience: initial?.audience || "Saúde geral",
  });

  const update = <K extends keyof PostFormValues>(k: K, v: PostFormValues[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  return (
    <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0] pl-5 pr-4 py-4 space-y-4">
      <h2 className="text-base text-foreground">Criar novo post</h2>

      <div className="space-y-2">
        <Label className="text-sm">Tipo de post</Label>
        <Select value={values.post_type} onValueChange={(v) => update("post_type", v)}>
          <SelectTrigger className="bg-white text-base"><SelectValue /></SelectTrigger>
          <SelectContent>
            {POST_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Tema (1 frase)</Label>
        <Textarea
          value={values.theme}
          onChange={(e) => update("theme", e.target.value)}
          placeholder="Ex: benefícios da proteína no café da manhã"
          className="bg-white min-h-[80px] text-base"
          maxLength={240}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm">Tom</Label>
          <Select value={values.tone} onValueChange={(v) => update("tone", v)}>
            <SelectTrigger className="bg-white text-base"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Público</Label>
          <Select value={values.audience} onValueChange={(v) => update("audience", v)}>
            <SelectTrigger className="bg-white text-base"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AUDIENCES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        className="w-full bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white rounded-2xl h-12 text-base"
        disabled={loading || !values.theme.trim()}
        onClick={() => onSubmit(values)}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando…</>
        ) : (
          <><Sparkles className="w-4 h-4 mr-2" /> Gerar post com IA</>
        )}
      </Button>
    </div>
  );
};
