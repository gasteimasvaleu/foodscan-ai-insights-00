import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';

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
  console.log('VideoModal rendering:', { isOpen, workout });
  if (!workout) return null;

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.includes('youtube.com') || url.includes('youtu.be') || url.endsWith('.mp4') || url.endsWith('.webm');
    } catch {
      return false;
    }
  };

  const getEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // For other URLs, return as is
    return url;
  };

  const embedUrl = getEmbedUrl(workout.video_url);
  const isYouTube = embedUrl.includes('youtube.com/embed');
  const isValidVideoUrl = isValidUrl(workout.video_url);

  const openInNewTab = () => {
    window.open(workout.video_url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold pr-8">{workout.title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={openInNewTab}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir em nova aba
            </Button>
          </div>
          <DialogDescription className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium">{workout.activity_type}</span>
            {workout.duration && <span>• {workout.duration} min</span>}
            {workout.calories && <span>• {workout.calories} kcal</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          {/* Video Container */}
          <div className="flex-1 bg-black rounded-lg overflow-hidden">
            {!isValidVideoUrl ? (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <p className="text-lg mb-2">URL de vídeo inválida</p>
                  <p className="text-sm text-gray-400">Não foi possível carregar o vídeo.</p>
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
            ) : (
              <video
                src={workout.video_url}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            )}
          </div>

          {/* Description */}
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