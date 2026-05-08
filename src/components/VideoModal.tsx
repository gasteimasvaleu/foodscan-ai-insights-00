import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: {
    title: string;
    description?: string;
    video_url: string;
    activity_type: string;
    duration?: number;
    calories?: number;
  } | null;
}

export const VideoModal = ({ isOpen, onClose, workout }: VideoModalProps) => {
  const [videoError, setVideoError] = useState(false);

  if (!workout) return null;

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Vimeo: vimeo.com/{ID} or vimeo.com/{ID}/{HASH} (private videos)
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const path = url.split('vimeo.com/')[1]?.split('?')[0] || '';
      const [videoId, hash] = path.split('/');
      if (videoId && /^\d+$/.test(videoId)) {
        return hash
          ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
          : `https://player.vimeo.com/video/${videoId}`;
      }
    }
    return url;
  };

  const embedUrl = getEmbedUrl(workout.video_url);
  const isIframeEmbed =
    embedUrl.includes('youtube.com/embed') ||
    embedUrl.includes('player.vimeo.com/video');
  const isValidVideoUrl = isValidUrl(workout.video_url);

  const openInNewTab = () => {
    window.open(workout.video_url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[calc(100%-2rem)] max-h-[90vh] flex flex-col rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold">{workout.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium">{workout.activity_type}</span>
            {workout.duration && <span>• {workout.duration} min</span>}
            {workout.calories && <span>• {workout.calories} kcal</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4">
          <div className="aspect-video flex-shrink-0 bg-black rounded-lg overflow-hidden">
            {!isValidVideoUrl ? (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <p className="text-lg mb-2">URL de vídeo inválida</p>
                  <p className="text-sm text-muted-foreground">Não foi possível carregar o vídeo.</p>
                </div>
              </div>
            ) : isYouTube ? (
              <iframe
                src={embedUrl}
                title={workout.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoError ? (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center space-y-3">
                  <p className="text-lg">Não foi possível reproduzir o vídeo</p>
                  <Button onClick={openInNewTab} variant="outline" className="gap-2 text-white border-white hover:bg-white/20">
                    <ExternalLink className="w-4 h-4" />
                    Abrir externamente
                  </Button>
                </div>
              </div>
            ) : (
              <video
                src={workout.video_url}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
                onError={() => setVideoError(true)}
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            )}
          </div>

          {workout.description && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {workout.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
