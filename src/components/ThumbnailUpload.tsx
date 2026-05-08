import { FileUpload } from "./FileUpload";
import { Label } from "@/components/ui/label";
import { Image } from "lucide-react";

interface ThumbnailUploadProps {
  onThumbnailSelect: (url: string) => void;
  onRemove?: () => void;
  currentUrl?: string;
  label?: string;
  required?: boolean;
}

export const ThumbnailUpload = ({
  onThumbnailSelect,
  onRemove,
  currentUrl,
  label = "Thumbnail",
  required = false
}: ThumbnailUploadProps) => {
  const handleFileSelect = (url: string, file: File) => {
    onThumbnailSelect(url);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      <FileUpload
        accept=".jpg,.jpeg,.png,.webp"
        maxSize={50} // 50MB for thumbnails
        folder="workout-content/thumbnails"
        onFileSelect={handleFileSelect}
        onRemove={onRemove}
        currentUrl={currentUrl}
        placeholder="Clique para selecionar ou arraste uma imagem aqui"
      >
        {currentUrl && (
          <div className="mt-3 p-3 bg-muted rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <Image className="w-4 h-4 text-primary" />
              <span className="text-sm">Thumbnail selecionada</span>
            </div>
            <img 
              src={currentUrl} 
              alt="Thumbnail preview"
              className="w-full max-h-32 object-cover rounded"
            />
          </div>
        )}
      </FileUpload>
    </div>
  );
};