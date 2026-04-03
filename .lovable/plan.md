

## Padronizar títulos dos cards na página Sono

### Problema
Os títulos dos cards na página Sleep usam ícones antes do texto e `font-bold`, enquanto outras páginas como Hidratação usam apenas `text-base` sem ícones — fora do padrão.

### Alteração

**`src/pages/Sleep.tsx`** — Remover ícones e alinhar o estilo dos `CardTitle` ao padrão da Hidratação:

| Card | Antes | Depois |
|------|-------|--------|
| Registro de Hoje | `<Clock /> Registro de Hoje` | `Registro de Hoje` |
| Últimos 7 Dias | `<Calendar /> Últimos 7 Dias` | `Últimos 7 Dias` |
| Estatísticas | `<TrendingUp /> Estatísticas` | `Estatísticas` |
| Histórico Recente | já sem ícone ✓ | sem mudança |
| Mensagem Motivacional | `<Sun /> Mensagem Motivacional` | `Mensagem Motivacional` |

Para cada um, trocar:
```
className="text-base font-bold text-foreground flex items-center gap-2"
```
por:
```
className="text-base"
```

E remover os componentes de ícone (`Clock`, `Calendar`, `TrendingUp`, `Sun`) dos títulos. Limpar imports não utilizados.

