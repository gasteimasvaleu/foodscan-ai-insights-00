import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, ExternalLink, Smartphone, BookOpen, Users, Heart } from 'lucide-react';

interface ResourcesSectionProps {
  content: {
    title: string;
    intro: string;
    emergency: { title: string; items: Array<{ name: string; contact: string; description: string; type: string }> };
    online: { title: string; items: Array<{ name: string; url: string; description: string }> };
    apps: { title: string; items: Array<{ name: string; description: string }> };
    books: { title: string; items: Array<{ title: string; author: string; description: string }> };
    forPartners: { title: string; content: string };
  };
}

export function ResourcesSection({ content }: ResourcesSectionProps) {
  return (
    <div className="space-y-4">
      <Card className="border-none bg-[#FFD1E7]">
        <CardContent className="pt-6">
          <p className="text-base text-gray-700 leading-relaxed">{content.intro}</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-red-700">
            <Phone className="h-5 w-5" />
            {content.emergency.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {content.emergency.items.map((it, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-red-100">
                <div className="flex items-start gap-3 min-w-0">
                  {it.type === 'phone' ? <Phone className="h-5 w-5 text-red-600 mt-0.5 shrink-0" /> : <MapPin className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium truncate">{it.name}</h4>
                    <p className="text-xs text-gray-600">{it.description}</p>
                  </div>
                </div>
                {it.type === 'phone' && (
                  <Button size="sm" asChild className="bg-red-600 hover:bg-red-700 shrink-0">
                    <a href={`tel:${it.contact}`}><Phone className="h-4 w-4 mr-1" />{it.contact}</a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-[#FD46A1]" />
            {content.online.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {content.online.items.map((it, i) => (
              <a key={i} href={it.url} target="_blank" rel="noopener noreferrer"
                className="p-3 rounded-2xl border bg-white hover:border-[#FD46A1] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-medium">{it.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{it.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-[#FD46A1] shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-[#FD46A1]" />
            {content.apps.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3">
            {content.apps.items.map((a, i) => (
              <div key={i} className="p-3 rounded-2xl bg-white border text-center">
                <div className="w-10 h-10 rounded-xl bg-[#FFD1E7] flex items-center justify-center mx-auto mb-2">
                  <Smartphone className="h-5 w-5 text-[#FD46A1]" />
                </div>
                <h4 className="text-sm font-medium">{a.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{a.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-md border-white/40">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#FD46A1]" />
            {content.books.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {content.books.items.map((b, i) => (
              <div key={i} className="p-3 rounded-2xl border bg-white">
                <h4 className="text-sm font-medium">{b.title}</h4>
                <Badge variant="secondary" className="mt-1 bg-[#FFD1E7] text-[#FD46A1]">{b.author}</Badge>
                <p className="text-xs text-gray-600 mt-2">{b.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-pink-200 bg-[#FFD1E7]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-[#FD46A1]">
            <Users className="h-5 w-5" />
            {content.forPartners.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-[#FD46A1] mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed">{content.forPartners.content}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
