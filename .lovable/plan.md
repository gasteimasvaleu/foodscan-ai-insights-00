

## Adicionar "Objetivos" ao menu "+" da navbar inferior

Adicionar um item para a página `/objetivos` no array `moreSheetItems` em `src/components/ui/tubelight-navbar.tsx`, usando o ícone `Target` do Lucide e descrição "Monitore suas metas semanais".

### Alteração

**`src/components/ui/tubelight-navbar.tsx`**
- Importar `Target` do `lucide-react`
- Adicionar ao array `moreSheetItems`:
```ts
{
  name: "Objetivos",
  description: "Monitore suas metas semanais",
  url: "/objetivos",
  icon: Target,
}
```

