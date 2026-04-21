import { useRef, useState } from "react";
import { Camera, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

export const DishImageUpload = ({ onSelect, disabled }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (f && f.type.startsWith("image/")) onSelect(f);
  };

  return (
    <Card
      className={`bg-[#FFD1E7]/40 border-2 border-dashed transition-colors rounded-3xl shadow-xl ${
        isDragging ? "border-primary bg-[#FFD1E7]/70" : "border-primary/30"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
          <ImageIcon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">Envie a foto do prato</h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-xs">
          A IA vai identificar o prato e gerar a receita caseira completa, com versão mais saudável quando for fast-food.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            type="button"
            disabled={disabled}
            onClick={() => cameraRef.current?.click()}
            className="flex-1 gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white"
          >
            <Camera className="w-4 h-4" />
            Tirar foto
          </Button>
          <Button
            type="button"
            disabled={disabled}
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="flex-1 gap-2 rounded-xl"
          >
            <Upload className="w-4 h-4" />
            Galeria
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
