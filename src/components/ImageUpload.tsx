import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, X, RotateCcw, Brain, BarChart3 } from "lucide-react";
import { BarcodeScanner } from "./BarcodeScanner";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onBarcodeAnalysis?: (barcode: string) => void;
  isAnalyzing?: boolean;
}

export const ImageUpload = ({ onImageSelect, onBarcodeAnalysis, isAnalyzing = false }: ImageUploadProps) => {
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
      
      // Scroll suave para a seção de resultados após um pequeno delay
      setTimeout(() => {
        const resultsSection = document.querySelector('[data-results-section]') || 
                             document.querySelector('.bg-success-50') ||
                             document.querySelector('[data-description-section]');
        
        if (resultsSection) {
          resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        } else {
          // Se não encontrar a seção específica, rola para baixo na página
          window.scrollTo({
            top: window.scrollY + 400,
            behavior: 'smooth'
          });
        }
      }, 300);
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
    <div className="w-full max-w-2xl mx-auto p-6">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
        className="hidden"
      />
      
      <Tabs defaultValue="fresh" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="fresh" className="gap-2">
            <Brain className="w-4 h-4" />
            Comida Fresca
          </TabsTrigger>
          <TabsTrigger value="barcode" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Industrializada
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="fresh" className="space-y-4">
          {!selectedImage ? (
            <Card 
              className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer min-h-[300px] flex items-center justify-center"
              onClick={handleUploadClick}
            >
              <CardContent className="flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Adicionar Foto do Alimento</h3>
                <p className="text-muted-foreground mb-4">
                  Tire uma foto ou selecione uma imagem da galeria para análise com IA
                </p>
                <Button variant="secondary" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Selecionar Imagem
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src={selectedImage} 
                    alt="Alimento selecionado" 
                    className="w-full h-64 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-center">Imagem Carregada</h3>
                  <p className="text-muted-foreground text-center text-sm">
                    Sua imagem está pronta para análise nutricional com IA
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={handleRemoveImage}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Trocar
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? "Analisando..." : "Analisar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="barcode" className="space-y-4">
          <BarcodeScanner 
            onBarcodeAnalysis={onBarcodeAnalysis || (() => {})}
            isAnalyzing={isAnalyzing}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};