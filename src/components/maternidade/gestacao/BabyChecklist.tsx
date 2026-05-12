import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { matGet, matSet } from '@/lib/maternidadeStorage';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import pregnancy from '@/data/maternidade/pregnancy-pt.json';

type ChecklistData = typeof pregnancy.checklist;

export const BabyChecklist = () => {
  const { user } = useAuth();
  const data = pregnancy.checklist as ChecklistData;
  const tool = pregnancy.tools.checklist;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setChecked(matGet<Record<string, boolean>>(user?.id, 'gestacao:enxoval', {}));
  }, [user?.id]);

  const toggle = (catKey: string, item: string) => {
    const k = `${catKey}:${item}`;
    const next = { ...checked, [k]: !checked[k] };
    if (!next[k]) delete next[k];
    setChecked(next);
    matSet(user?.id, 'gestacao:enxoval', next);
  };

  const total = Object.values(data.categories).reduce((s, c) => s + c.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="bg-[#FFD1E7] rounded-3xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base text-gray-800">{data.title}</h3>
          <p className="text-xs text-gray-600 mt-0.5">{tool.description}</p>
        </div>
        <span className="text-xs bg-white/70 backdrop-blur-md text-[#FD46A1] rounded-full px-2.5 py-1 font-semibold">
          {done}/{total}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-700">
          <span>{tool.progress}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2.5" />
        <div className="flex justify-between text-[10px] text-gray-600">
          <span>✓ {tool.purchased}: {done}</span>
          <span>○ {tool.remaining}: {total - done}</span>
        </div>
      </div>

      <Accordion type="multiple" className="w-full space-y-2">
        {Object.entries(data.categories).map(([key, cat]) => {
          const catDone = cat.items.filter((i) => checked[`${key}:${i}`]).length;
          const catProgress = cat.items.length > 0 ? (catDone / cat.items.length) * 100 : 0;
          return (
            <AccordionItem key={key} value={key} className="bg-white/60 backdrop-blur-md rounded-2xl border-0 px-3">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800">{cat.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={catProgress} className="h-1.5 flex-1 max-w-32" />
                    <span className="text-[10px] text-gray-600">{catDone}/{cat.items.length}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1.5 pb-2">
                  {cat.items.map((item, i) => {
                    const isChecked = !!checked[`${key}:${item}`];
                    return (
                      <label
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/50"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggle(key, item)}
                          className="data-[state=checked]:bg-[#FD46A1] data-[state=checked]:border-[#FD46A1]"
                        />
                        <span className={`text-sm ${isChecked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
