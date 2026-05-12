import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Activity, Users, Brain, AlertTriangle, Clock } from 'lucide-react';

interface SymptomsSectionProps {
  content: {
    title: string;
    intro: string;
    categories: Record<'emotional' | 'physical' | 'behavioral' | 'cognitive', { title: string; icon: string; items: string[] }>;
    timeline: { title: string; items: Array<{ period: string; description: string }> };
    redFlags: { title: string; items: string[]; action: string };
  };
}

const iconMap: Record<string, React.ElementType> = { Heart, Activity, Users, Brain };

export function SymptomsSection({ content }: SymptomsSectionProps) {
  const categories = Object.entries(content.categories);
  return (
    <div className="space-y-4">
      <Card className="border-none bg-[#FFD1E7]">
        <CardContent className="pt-6">
          <p className="text-base text-gray-700 leading-relaxed">{content.intro}</p>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map(([key, cat]) => {
          const Icon = iconMap[cat.icon] || Heart;
          return (
            <Card key={key} className="bg-white/70 backdrop-blur-md border-white/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-[#FD46A1]" />
                  {cat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {cat.items.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#FD46A1] mt-1">•</span>{it}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#FD46A1]" />
            {content.timeline.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {content.timeline.items.map((it, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#FD46A1]" />
                  {i < content.timeline.items.length - 1 && <div className="w-0.5 h-12 bg-pink-200" />}
                </div>
                <div className="pb-2">
                  <Badge variant="secondary" className="mb-1 bg-[#FFD1E7] text-[#FD46A1]">{it.period}</Badge>
                  <p className="text-sm text-gray-700">{it.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            {content.redFlags.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {content.redFlags.items.map((it, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />{it}
              </li>
            ))}
          </ul>
          <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-sm text-red-700">
            {content.redFlags.action}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
