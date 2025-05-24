
import React, { useState, useRef } from 'react';
import { Upload, Camera, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onImageSelect(selectedFile);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Upload Area */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
        {!selectedImage ? (
          <div
            onClick={handleUploadClick}
            className="border-2 border-dashed border-primary-300 rounded-2xl p-12 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-300 group"
          >
            <div className="space-y-4">
              <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Faça upload da sua foto
                </h3>
                <p className="text-gray-600 mb-4">
                  Clique aqui ou arraste uma imagem do seu prato ou alimento
                </p>
                <p className="text-sm text-gray-500">
                  Formatos suportados: JPG, PNG, WebP (máx. 10MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full max-w-md mx-auto rounded-2xl shadow-lg"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200 shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Imagem selecionada
              </h3>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleUploadClick}
                  variant="outline"
                  className="rounded-xl"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Trocar Imagem
                </Button>
                <Button
                  onClick={handleAnalyze}
                  className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Analisar Alimento
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};
