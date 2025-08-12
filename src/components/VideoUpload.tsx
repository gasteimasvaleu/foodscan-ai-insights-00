import { FileUpload } from "./FileUpload";
import { Label } from "@/components/ui/label";
import { Play } from "lucide-react";

interface VideoUploadProps {
  onVideoSelect: (url: string) => void;
  onRemove?: () => void;
  currentUrl?: string;
  label?: string;
  required?: boolean;
}

export const VideoUpload = ({
  onVideoSelect,
  onRemove,
  currentUrl,
  label = "Vídeo",
  required = false
}: VideoUploadProps) => {
  const handleFileSelect = (url: string, file: File) => {
    onVideoSelect(url);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <FileUpload
        accept=".mp4,.webm,.mov,.avi"
        maxSize={100} // 100MB for videos
        folder="workout-content/videos"
        onFileSelect={handleFileSelect}
        onRemove={onRemove}
        currentUrl={currentUrl}
        placeholder="Clique para selecionar ou arraste um vídeo aqui"
      >
        {currentUrl && (
          <div className="mt-3 p-3 bg-muted rounded-md">
            <div className="flex items-center space-x-2">
              <Play className="w-4 h-4 text-primary" />
              <span className="text-sm">Vídeo carregado</span>
            </div>
            <video 
              src={currentUrl} 
              className="mt-2 w-full max-h-32 object-cover rounded"
              controls
              preload="metadata"
            />
          </div>
        )}
      </FileUpload>
    </div>
  );
};