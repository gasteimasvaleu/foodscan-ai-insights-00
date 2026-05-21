import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import data from '@/data/maternidade/bebe-pt.json';

export function EducationalContent() {
  return (
    <div className="space-y-3">
      {data.education.map((item) => (
        <Card key={item.title} className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]">
          <CardHeader className="pl-5 pb-2">
            <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="pl-5">
            <p className="text-sm text-gray-700 leading-relaxed">{item.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
