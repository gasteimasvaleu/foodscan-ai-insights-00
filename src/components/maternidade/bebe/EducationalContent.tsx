import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import data from '@/data/maternidade/bebe-pt.json';

export function EducationalContent() {
  return (
    <div className="space-y-3">
      {data.education.map((item) => (
        <Card key={item.title} className="bg-white/70 backdrop-blur-md border-white/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">{item.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
