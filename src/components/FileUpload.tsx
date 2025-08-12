import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload, File, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadToSupabase, UploadProgress } from "@/utils/uploadToSupabase";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  accept: string;
  maxSize: number; // in MB
  folder: string;
  onFileSelect: (url: string, file: File) => void;
  onRemove?: () => void;
  currentUrl?: string;
  children?: React.ReactNode;
  className?: string;
  placeholder?: string;
}

export const FileUpload = ({
  accept,
  maxSize,
  folder,
  onFileSelect,
  onRemove,
  currentUrl,
  children,
  className,
  placeholder = "Clique para selecionar ou arraste um arquivo aqui"
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ progress: 0, isUploading: false });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const maxSizeBytes = maxSize * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      toast({
        title: "Arquivo muito grande",
        description: `O arquivo deve ter no máximo ${maxSize}MB`,
        variant: "destructive",
      });
      return false;
    }

    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileType = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    if (!acceptedTypes.includes(fileType) && !acceptedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: `Tipos aceitos: ${accept}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    
    try {
      const result = await uploadToSupabase(file, folder, setUploadProgress);
      onFileSelect(result.url, file);
      
      toast({
        title: "Upload concluído",
        description: "Arquivo enviado com sucesso!",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: "Falha ao enviar o arquivo. Tente novamente.",
        variant: "destructive",
      });
      setSelectedFile(null);
    }
  }, [folder, onFileSelect, maxSize, accept]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasFile = currentUrl || selectedFile;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          hasFile && "border-solid border-border"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!uploadProgress.isUploading ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={uploadProgress.isUploading}
        />

        {uploadProgress.isUploading ? (
          <div className="text-center space-y-2">
            <Upload className="w-8 h-8 mx-auto text-primary animate-pulse" />
            <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
            <Progress value={uploadProgress.progress} className="w-full" />
          </div>
        ) : hasFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium">
                  {selectedFile?.name || "Arquivo carregado"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedFile && `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{placeholder}</p>
            <p className="text-xs text-muted-foreground">
              Máximo {maxSize}MB • {accept}
            </p>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};