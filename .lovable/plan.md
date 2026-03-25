

## Padronizar tabs do FitTracker com o estilo do FoodScan

O TabsList do FitTracker usa estilo glass (bg-white/10, text-white, active:text-blue-600). O do FoodScan usa o estilo padrão do componente (bg-muted, sem customização extra).

### Alteração

**src/pages/FitTracker.tsx** (linhas 69-81):
- **TabsList** (linha 69): trocar `bg-white/10 backdrop-blur-md border border-white/20 shadow-lg` por apenas `grid w-full grid-cols-3 mb-6` (mesmo do ImageUpload)
- **TabsTrigger** (linhas 70, 74, 78): remover classes customizadas `data-[state=active]:bg-white/90 data-[state=active]:text-blue-600 data-[state=active]:shadow-md hover:bg-white/10 transition-all duration-300 text-white drop-shadow-lg`, manter apenas `gap-2` (mesmo do ImageUpload)

Resultado: as tabs ficarão com fundo cinza claro (muted) e texto escuro, idêntico ao componente do FoodScan.

