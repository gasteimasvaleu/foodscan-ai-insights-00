import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Item {
  key: string;
  label: string;
  description: string;
}
interface Group {
  title: string;
  items: Item[];
}
interface Props {
  content: { intro: string; groups: Group[] };
}

export function PreconceptionChecklist({ content }: Props) {
  const { user } = useAuth();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('preconception_checklist')
        .select('item_key')
        .eq('user_id', user.id);
      if (data) setChecked(new Set(data.map((r: any) => r.item_key)));
    })();
  }, [user]);

  const total = useMemo(
    () => content.groups.reduce((acc, g) => acc + g.items.length, 0),
    [content]
  );
  const done = checked.size;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const toggle = async (key: string) => {
    if (!user) return;
    const isChecked = checked.has(key);
    const next = new Set(checked);
    if (isChecked) next.delete(key);
    else next.add(key);
    setChecked(next);
    if (isChecked) {
      await supabase.from('preconception_checklist').delete().eq('user_id', user.id).eq('item_key', key);
    } else {
      await supabase.from('preconception_checklist').insert({ user_id: user.id, item_key: key });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-none bg-[#FFD1E7]">
        <CardContent className="pt-6 space-y-3">
          <p className="text-base text-gray-700 leading-relaxed">{content.intro}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-700">
              <span>Progresso</span>
              <span>{done}/{total}</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {content.groups.map((g) => (
        <Card key={g.title} className="border-none bg-[#FFD1E7]">
          <CardHeader>
            <CardTitle className="text-base font-semibold">{g.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {g.items.map((it) => (
                <label
                  key={it.key}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-white cursor-pointer"
                >
                  <Checkbox
                    checked={checked.has(it.key)}
                    onCheckedChange={() => toggle(it.key)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800">{it.label}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{it.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
