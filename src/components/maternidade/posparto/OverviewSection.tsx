import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, AlertTriangle, CheckCircle, XCircle, AlertCircle, Brain, Shield, Users } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SpectrumCondition {
  id: string;
  name: string;
  icon: string;
  color: string;
  prevalence: string;
  description: string;
  symptoms: string[];
  important: string;
}

interface OverviewSectionProps {
  content: {
    title: string;
    intro: string;
    whatIs: { title: string; content: string };
    babyBlues: {
      title: string;
      blues: { title: string; items: string[] };
      dpp: { title: string; items: string[] };
    };
    riskFactors: { title: string; items: string[] };
    myths: { title: string; items: Array<{ myth: string; truth: string }> };
    message: { title: string; content: string };
    spectrum?: { title: string; intro: string; conditions: SpectrumCondition[] };
  };
}

const iconMap: Record<string, React.ElementType> = {
  AlertCircle, Brain, Shield, AlertTriangle, Users, Heart,
};

export function OverviewSection({ content }: OverviewSectionProps) {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-[#FFD1E7]">
        <CardContent className="pt-6">
          <p className="text-base text-gray-700 leading-relaxed">{content.intro}</p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#FD46A1]" />
            {content.whatIs.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed">{content.whatIs.content}</p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader>
          <CardTitle className="text-base">{content.babyBlues.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <h4 className="text-sm text-blue-700 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {content.babyBlues.blues.title}
              </h4>
              <ul className="space-y-1.5">
                {content.babyBlues.blues.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-blue-700">
                    <span>•</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFD1E7] border border-pink-200">
              <h4 className="text-sm text-[#FD46A1] mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {content.babyBlues.dpp.title}
              </h4>
              <ul className="space-y-1.5">
                {content.babyBlues.dpp.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span>•</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader>
          <CardTitle className="text-base">{content.riskFactors.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {content.riskFactors.items.map((f, i) => (
              <Badge key={i} variant="outline" className="py-1 px-3 text-xs">{f}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {content.spectrum && (
        <Card className="bg-white/70 backdrop-blur-md border-white/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#FD46A1]" />
              {content.spectrum.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-3">{content.spectrum.intro}</p>
            <Accordion type="single" collapsible>
              {content.spectrum.conditions.map((c) => {
                const Icon = iconMap[c.icon] || AlertCircle;
                return (
                  <AccordionItem key={c.id} value={c.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <div className="p-2 rounded-lg bg-[#FFD1E7]">
                          <Icon className="h-4 w-4 text-[#FD46A1]" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{c.name}</span>
                          <Badge className="ml-2 bg-[#FFD1E7] text-[#FD46A1] text-xs">{c.prevalence}</Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-3 rounded-xl bg-pink-50 border border-pink-100 space-y-3">
                        <p className="text-sm text-gray-700">{c.description}</p>
                        <div>
                          <h5 className="text-sm text-[#FD46A1] mb-1">Sintomas:</h5>
                          <ul className="space-y-1">
                            {c.symptoms.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                                <span className="text-[#FD46A1]">•</span>{s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={`p-2 rounded-md border text-xs ${c.color === 'red' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                          {c.important}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader>
          <CardTitle className="text-base">{content.myths.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {content.myths.items.map((item, i) => (
              <AccordionItem key={i} value={`m-${i}`}>
                <AccordionTrigger className="text-left">
                  <span className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                    {item.myth}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-green-700">{item.truth}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-2 border-pink-200 bg-[#FFD1E7]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-[#FD46A1]">
            <Heart className="h-5 w-5 fill-current" />
            {content.message.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 italic leading-relaxed">"{content.message.content}"</p>
        </CardContent>
      </Card>
    </div>
  );
}
