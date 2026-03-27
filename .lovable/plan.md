

## Adicionar Apple Health no menu "+"

### Alteração
Adicionar um item "Apple Health" ao array `moreSheetItems` em `src/components/ui/tubelight-navbar.tsx`.

### Detalhes
- Importar o ícone `Heart` do lucide-react (consistente com o uso em FitTracker)
- Adicionar entrada no array `moreSheetItems`:
  - name: "Apple Health"
  - description: "Dados detalhados de saúde e atividade"
  - url: "/apple-health"
  - icon: Heart

### Arquivo
`src/components/ui/tubelight-navbar.tsx` — adicionar import de `Heart` e novo item no array

