import React, { useState } from 'react';
import { Upload, Camera, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageSelect: (imageDataUrl: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setSelectedImage(imageDataUrl);
        onImageSelect(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageDataUrl = e.target?.result as string;
          setSelectedImage(imageDataUrl);
          onImageSelect(imageDataUrl);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-4">
          Faça o upload da imagem da sua comida
        </h3>
        
        {!selectedImage ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/30 rounded-xl p-8 bg-white/5">
              <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <p className="text-white/80 text-sm mb-4">
                Arraste uma imagem aqui ou clique para selecionar
              </p>
              <Button
                onClick={handleUploadClick}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Selecionar Imagem
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Imagem selecionada"
                className="w-full max-w-md mx-auto rounded-xl shadow-lg"
              />
              <Button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-white/80 text-sm">
              Imagem carregada com sucesso! Clique em "Analisar" para continuar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};