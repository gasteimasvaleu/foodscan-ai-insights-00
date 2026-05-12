import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import pregnancy from '@/data/maternidade/pregnancy-pt.json';

const TRIMESTERS = ['trimester1', 'trimester2', 'trimester3'] as const;

export const ExamsSection = () => {
  const data = pregnancy.exams;

  return (
    <div className="space-y-4">
      <div className="bg-[#FFD1E7] rounded-3xl p-4">
        <h3 className="text-base text-gray-800">{data.title}</h3>
        <p className="text-xs text-gray-600 mt-0.5">Acompanhe os exames recomendados para cada fase</p>
      </div>

      {TRIMESTERS.map((k) => {
        const t = data[k];
        return (
          <div key={k} className="bg-[#FFD1E7] rounded-3xl p-4 space-y-3">
            <h4 className="text-sm font-medium text-[#FD46A1]">{t.title}</h4>
            <Accordion type="single" collapsible className="space-y-2">
              {t.items.map((exam, i) => (
                <AccordionItem
                  key={i}
                  value={`${k}-${i}`}
                  className="bg-white/60 backdrop-blur-md rounded-2xl border-0 px-3"
                >
                  <AccordionTrigger className="hover:no-underline py-3 text-sm font-medium text-gray-800 text-left">
                    {exam.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pb-2">
                      <p className="text-sm text-gray-700">{exam.description}</p>
                      <span className="inline-block text-[11px] bg-[#FD46A1]/10 text-[#FD46A1] rounded-full px-2.5 py-0.5">
                        {exam.when}
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        );
      })}
    </div>
  );
};
