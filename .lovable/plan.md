## Ajuste no Menu Mais — Mercado Fácil

**Problema**: As opções "Sou Lojista (MF)" e "Sou Entregador (MF)" aparecem separadas no menu "Mais", mas essas funções já são acessíveis dentro da própria rota `/mercado-facil`, tornando as entradas redundantes.

**Mudança**: Remover as 2 entradas duplicadas do `moreSheetItems` em `src/components/ui/tubelight-navbar.tsx`, mantendo apenas a entrada principal "Mercado Fácil".

**Arquivo afetado**:
- `src/components/ui/tubelight-navbar.tsx` — remover linhas 33-34 do array `moreSheetItems`

**Sem impacto funcional**: os links internos em `/mercado-facil`, `/mercado-facil/lojista` e `/mercado-facil/entregador` continuam funcionando normalmente.