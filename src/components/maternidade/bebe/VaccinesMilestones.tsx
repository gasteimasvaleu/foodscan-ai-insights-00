import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import data from '@/data/maternidade/bebe-pt.json';
import type { BabyProfile } from './BabyProfileCard';

type Item = { key: string; label: string; ageMonths: number };

export function VaccinesMilestones({ profile }: { profile: BabyProfile | null }) {
  const { user } = useAuth();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const load = async () => {
    if (!user) return;
    const { data: rows } = await supabase
      .from('baby_checklist').select('item_key').eq('user_id', user.id);
    setChecked(new Set((rows || []).map((r) => r.item_key)));
  };
  useEffect(() => { load(); }, [user]);

  const toggle = async (key: string) => {
    if (!user) return;
    const isChecked = checked.has(key);
    const next = new Set(checked);
    isChecked ? next.delete(key) : next.add(key);
    setChecked(next);
    if (isChecked) {
      await supabase.from('baby_checklist').delete().eq('user_id', user.id).eq('item_key', key);
    } else {
      await supabase.from('baby_checklist').insert({ user_id: user.id, item_key: key });
    }
  };

  const ageMonths = useMemo(() => {
    if (!profile) return null;
    const b = new Date(profile.birth_date + 'T00:00:00');
    const now = new Date();
    return (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  }, [profile]);

  return (
    <div className="space-y-4">
      <ChecklistCard
        title="Vacinas"
        items={data.vaccines as Item[]}
        checked={checked}
        onToggle={toggle}
        ageMonths={ageMonths}
        bg="bg-[#FFD1E7]"
      />
      <ChecklistCard
        title="Marcos do desenvolvimento"
        items={data.milestones as Item[]}
        checked={checked}
        onToggle={toggle}
        ageMonths={ageMonths}
        bg="bg-white/70 backdrop-blur-md"
      />
    </div>
  );
}

function ChecklistCard({
  title, items, checked, onToggle, ageMonths, bg,
}: {
  title: string;
  items: Item[];
  checked: Set<string>;
  onToggle: (k: string) => void;
  ageMonths: number | null;
  bg: string;
}) {
  const done = items.filter((i) => checked.has(i.key)).length;
  const pct = Math.round((done / items.length) * 100);
  return (
    <Card className={`${bg} border-none rounded-3xl`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-gray-800">{title}</CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-white/70 rounded-full overflow-hidden">
            <div className="h-full bg-[#FD46A1]" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-gray-700">{done}/{items.length}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => {
          const due = ageMonths !== null && ageMonths >= item.ageMonths && !checked.has(item.key);
          return (
            <label
              key={item.key}
              className="flex items-start gap-3 bg-white/70 rounded-xl px-3 py-3 cursor-pointer"
            >
              <Checkbox
                checked={checked.has(item.key)}
                onCheckedChange={() => onToggle(item.key)}
                className="mt-0.5"
              />
              <span className="flex-1 text-sm text-gray-800">{item.label}</span>
              {due && <span className="text-xs text-[#FD46A1]">pendente</span>}
            </label>
          );
        })}
      </CardContent>
    </Card>
  );
}
