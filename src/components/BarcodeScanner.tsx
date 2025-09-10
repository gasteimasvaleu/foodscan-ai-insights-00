import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  onBarcodeAnalysis: (barcode: string) => void;
  isAnalyzing?: boolean;
}

export const BarcodeScanner = ({ onBarcodeAnalysis, isAnalyzing = false }: BarcodeScannerProps) => {
  const [barcode, setBarcode] = useState("");

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