import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface Props {
  content: {
    intro: string;
    cards: Array<{ title: string; items: string[] }>;
  };
}

export function EducationalContent({ content }: Props) {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-[#FFD1E7]">
        <CardContent className="pt-6">
          <p className="text-base text-gray-700 leading-relaxed">{content.intro}</p>
        </CardContent>
      </Card>

      {content.cards.map((card, i) => (
        <Card
          key={i}
          className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]"
        >
          <CardHeader className="pl-5">
            <CardTitle className="text-base font-semibold">{card.title}</CardTitle>
          </CardHeader>
          <CardContent className="pl-5">
            <ul className="space-y-2">
              {card.items.map((it, j) => (
                <li
                  key={j}
                  className="flex items-start gap-3 rounded-xl bg-[#FFD1E7]/20 border border-[#FD46A1]/15 p-3"
                >
                  <div className="h-6 w-6 rounded-lg bg-[#FFD1E7]/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-[#FD46A1]" />
                  </div>
                  <span className="text-sm text-gray-800 leading-relaxed flex-1 min-w-0">{it}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

