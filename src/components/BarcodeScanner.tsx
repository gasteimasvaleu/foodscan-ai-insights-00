import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BarChart3, Camera, X } from "lucide-react";
import { toast } from "sonner";
import { BrowserMultiFormatReader } from "@zxing/library";

interface BarcodeScannerProps {
  onBarcodeAnalysis: (barcode: string) => void;
  isAnalyzing?: boolean;
}

export const BarcodeScanner = ({ onBarcodeAnalysis, isAnalyzing = false }: BarcodeScannerProps) => {
  const [barcode, setBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const validateBarcode = (code: string): boolean => {
    // Remove espaços e caracteres especiais
    const cleanCode = code.replace(/\s|-/g, '');
    
    // Verificar se é numérico e tem comprimento válido
    const isNumeric = /^\d+$/.test(cleanCode);
    const validLengths = [8, 12, 13, 14]; // EAN-8, UPC-A, EAN-13, GTIN-14
    
    return isNumeric && validLengths.includes(cleanCode.length);
  };

  const handleSearch = () => {
    if (!barcode.trim()) {
      toast.error("Por favor, digite um código de barras");
      return;
    }

    const cleanBarcode = barcode.replace(/\s|-/g, '');
    
    if (!validateBarcode(cleanBarcode)) {
      toast.error("Código de barras inválido. Use códigos de 8, 12, 13 ou 14 dígitos");
      return;
    }

    onBarcodeAnalysis(cleanBarcode);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const startCamera = async () => {
    try {
      setIsScanning(true);
      
      // Verificar se o navegador suporta Barcode Detection API
      if ('BarcodeDetector' in window) {
        await startBarcodeDetection();
      } else {
        await startZXingScanner();
      }
    } catch (error) {
      console.error("Erro ao iniciar câmera:", error);
      toast.error("Erro ao acessar a câmera. Verifique as permissões.");
      setIsScanning(false);
    }
  };

  const startBarcodeDetection = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a']
      });
      
      const detectBarcodes = async () => {
        if (videoRef.current && isScanning) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const detectedBarcode = barcodes[0].rawValue;
              if (validateBarcode(detectedBarcode)) {
                setBarcode(detectedBarcode);
                stopCamera();
                onBarcodeAnalysis(detectedBarcode);
                toast.success("Código de barras detectado!");
                return;
              }
            }
          } catch (error) {
            console.error("Erro na detecção:", error);
          }
          
          setTimeout(detectBarcodes, 100);
        }
      };
      
      videoRef.current.onloadedmetadata = () => {
        detectBarcodes();
      };
    }
  };

  const startZXingScanner = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      readerRef.current = new BrowserMultiFormatReader();
      
      try {
        const result = await readerRef.current.decodeFromVideoDevice(
          undefined, 
          videoRef.current,
          (result, error) => {
            if (result) {
              const detectedBarcode = result.getText();
              if (validateBarcode(detectedBarcode)) {
                setBarcode(detectedBarcode);
                stopCamera();
                onBarcodeAnalysis(detectedBarcode);
                toast.success("Código de barras detectado!");
              }
            }
          }
        );
      } catch (error) {
        console.error("Erro no ZXing scanner:", error);
        toast.error("Erro ao inicializar o scanner");
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (readerRef.current) {
      readerRef.current.reset();
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Buscar Produto Industrializado</CardTitle>
        <CardDescription>
          Digite o código de barras do produto para obter informações nutricionais precisas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="barcode">Código de Barras</Label>
          <Input
            id="barcode"
            type="text"
            placeholder="Ex: 7891000100103"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isAnalyzing}
            className="text-center text-lg"
          />
          <p className="text-xs text-muted-foreground text-center">
            Aceita códigos EAN-8, EAN-13, UPC-A (8-14 dígitos)
          </p>
        </div>

        {!isScanning && (
          <div className="space-y-3">
            <Button 
              onClick={startCamera}
              disabled={isAnalyzing}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Camera className="w-4 h-4 mr-2" />
              Usar Câmera
            </Button>
            
            <Button 
              onClick={handleSearch}
              disabled={isAnalyzing || !barcode.trim()}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Produto
                </>
              )}
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 border-2 border-primary/50 rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-primary rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={stopCamera}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar Scanner
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Posicione o código de barras dentro do quadro para detectar automaticamente
            </p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2">Dica:</h4>
          <p className="text-xs text-muted-foreground">
            O código de barras geralmente está na parte de trás da embalagem e contém de 8 a 14 dígitos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};