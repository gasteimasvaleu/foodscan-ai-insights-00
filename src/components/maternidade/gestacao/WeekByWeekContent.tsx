import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import pregnancy from '@/data/maternidade/pregnancy-pt.json';

type WeeksData = typeof pregnancy.weeks;
const TRIMESTERS: (keyof WeeksData)[] = ['trimester1', 'trimester2', 'trimester3'];

export const WeekByWeekContent = () => {
  const [active, setActive] = useState<keyof WeeksData>('trimester1');
  const data = pregnancy.weeks as WeeksData;

  return (
    <Tabs value={active} onValueChange={(v) => setActive(v as keyof WeeksData)}>
      <TabsList className="grid w-full grid-cols-3 h-auto bg-white/70 backdrop-blur-md p-1 rounded-2xl">
        {TRIMESTERS.map((k) => (
          <TabsTrigger
            key={k}
            value={k}
            className="flex flex-col py-2 rounded-xl data-[state=active]:bg-[#FD46A1] data-[state=active]:text-white"
          >
            <span className="text-xs font-medium">{data[k].title}</span>
            <span className="text-[10px] opacity-80">{data[k].subtitle}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {TRIMESTERS.map((k) => (
        <TabsContent key={k} value={k} className="mt-4">
          <div className="bg-[#FFD1E7] rounded-3xl p-4 space-y-3">
            <div>
              <h3 className="text-base text-gray-800">{data[k].title}</h3>
              <p className="text-xs text-gray-600">{data[k].description}</p>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
              {data[k].weeks.map((w) => (
                <AccordionItem key={w.week} value={`w-${w.week}`} className="bg-white/60 backdrop-blur-md rounded-2xl border-0 px-3">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 rounded-full bg-[#FD46A1] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                        {w.week}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-800">Semana {w.week}</p>
                        <p className="text-xs text-gray-600">{w.babySize} • {w.babyLength}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-2">
                      <div className="bg-white/70 rounded-2xl p-3">
                        <p className="text-xs font-medium text-[#FD46A1] mb-1">Desenvolvimento</p>
                        <p className="text-sm text-gray-700">{w.development}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-amber-600 mb-1">Sintomas comuns</p>
                        <div className="flex flex-wrap gap-1.5">
                          {w.symptoms.map((s, i) => (
                            <span key={i} className="text-[11px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-emerald-600 mb-1">Dicas</p>
                        <ul className="space-y-1">
                          {w.tips.map((t, i) => (
                            <li key={i} className="text-sm text-gray-700 flex gap-2">
                              <span className="text-emerald-500">•</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
