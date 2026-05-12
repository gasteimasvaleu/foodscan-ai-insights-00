import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <Card key={i} className="bg-white/70 backdrop-blur-md border-white/40">
          <CardHeader>
            <CardTitle className="text-base">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
              {card.items.map((it, j) => (
                <li key={j} className="leading-relaxed">{it}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
