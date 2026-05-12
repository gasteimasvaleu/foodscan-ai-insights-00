import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Stethoscope, Brain, Users, Heart, CheckCircle, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface WhenToSeekHelpProps {
  content: {
    title: string;
    intro: string;
    signs: { title: string; items: string[] };
    professionals: { title: string; items: Array<{ title: string; description: string }> };
    treatments: { title: string; items: Array<{ title: string; description: string }> };
    firstVisit: { title: string; items: string[] };
    family: { title: string; items: string[] };
  };
}

const profIcons = [Stethoscope, Brain, Brain, Stethoscope];
const treatIcons = [Brain, Heart, Users, CheckCircle];

export function WhenToSeekHelp({ content }: WhenToSeekHelpProps) {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-[#FFD1E7]">
        <CardContent className="pt-6">
          <p className="text-base text-gray-700 leading-relaxed">{content.intro}</p>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            {content.signs.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid sm:grid-cols-2 gap-2">
            {content.signs.items.map((it, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />{it}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader><CardTitle className="text-base">{content.professionals.title}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {content.professionals.items.map((p, i) => {
              const Icon = profIcons[i] || Stethoscope;
              return (
                <div key={i} className="p-3 rounded-2xl border bg-white">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-[#FFD1E7]">
                      <Icon className="h-4 w-4 text-[#FD46A1]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{p.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{p.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader><CardTitle className="text-base">{content.treatments.title}</CardTitle></CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {content.treatments.items.map((t, i) => {
              const Icon = treatIcons[i] || CheckCircle;
              return (
                <AccordionItem key={i} value={`t-${i}`}>
                  <AccordionTrigger className="text-left">
                    <span className="flex items-center gap-2 text-sm">
                      <Icon className="h-4 w-4 text-[#FD46A1] shrink-0" />{t.title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="pl-6 text-sm text-gray-700">{t.description}</p>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#FD46A1]" />
            {content.firstVisit.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {content.firstVisit.items.map((it, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <Badge variant="outline" className="shrink-0 h-6 w-6 rounded-full p-0 flex items-center justify-center text-[#FD46A1] border-[#FD46A1]">{i + 1}</Badge>
                {it}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-2 border-pink-200 bg-[#FFD1E7]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-[#FD46A1]">
            <Users className="h-5 w-5" />
            {content.family.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2">
            {content.family.items.map((it, i) => (
              <div key={i} className="p-2 rounded-lg bg-white/70 border border-pink-200 flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-[#FD46A1] shrink-0" />{it}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
