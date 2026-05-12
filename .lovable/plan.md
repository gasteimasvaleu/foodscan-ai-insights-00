## Mudanças

### 1. Adicionar Maternidade no menu "+" (`src/components/ui/tubelight-navbar.tsx`)
Acrescentar no array `moreSheetItems` uma entrada nova:
```ts
{ name: 'Maternidade', description: 'Tentantes, gestação, pós-parto e bebê', url: '/maternidade', icon: Baby }
```
Importar `Baby` de `lucide-react`. Posicionar logo após "Sono" para agrupar com saúde/bem-estar.

### 2. Renderizar a Navbar superior em `/maternidade` (`src/pages/Maternidade.tsx`)
- Importar e renderizar `<Navbar />` no topo do retorno (mesmo padrão de Profile/WidgetGuide).
- Trocar o padding do container para `pt-[calc(env(safe-area-inset-top)+4rem)]` (padrão das páginas internas) para não esconder atrás da Navbar fixa.
- Remover o `<MaternidadeHeader />` antigo (sticky com botão voltar) — ele duplicava header e cobria a Navbar global.

### 3. Padronizar o card de título (substituir `MaternidadeHeader.tsx`)
Refatorar `MaternidadeHeader` para usar o padrão global de page header:
```tsx
<div className="mb-4 animate-fade-in">
  <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
    <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
      <Baby className="w-6 h-6 text-white" />
    </div>
    <h1 className="text-lg font-bold text-[#FD46A1]">Maternidade</h1>
  </div>
</div>
```
- Remove botão "voltar" (Navbar global cobre navegação).
- Mantém ícone `Baby` consistente com a entrada do menu.

## Fora do escopo
- Lógica das abas (Tentantes/Gestação/Pós-parto/Bebê) e dos sub-painéis.
- Outras páginas.
