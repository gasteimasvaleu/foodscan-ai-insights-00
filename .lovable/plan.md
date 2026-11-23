# Mesma largura e margens laterais da Home em todas as páginas

## Padrão da Home
- Margem lateral de 13px em todas as telas.
- No desktop e no iPad, o conteúdo fica centralizado com largura máxima de cerca de 900px (a mesma da Home).

## O que muda
Hoje as páginas usam larguras diferentes: umas bem estreitas (Receitas, Treinos, Loja, Sono, Quiz, Tô Aqui, Provador), outras médias (Mercado Fácil, WhatsApp, Tô Aqui painel) e outras bem largas (Plano de Treino, Minhas Dietas, Treinos). Também variam as margens laterais.

Vou deixar todas as páginas internas com a mesma largura e a mesma margem da Home, inclusive /alimentos, as páginas do Mercado Fácil, do Tô Aqui, as de admin e as do Perfil.

## O que fica como está
- Telas de conversa em tela cheia (DMs, chat global, chat do local), porque já ocupam a tela inteira.
- Janelas que abrem por cima (modais) e a tela de assinar, que ficam centralizadas no tamanho próprio.
- O conteúdo dos cards não muda; só a largura do bloco da página.

## Como vou conferir
- Prints da Home e de algumas páginas (Alimentos, Receitas, Treinos, Mercado Fácil, Tô Aqui) no desktop e no iPad, para comparar as bordas.

## Detalhes técnicos
- Criar `src/components/layout/PageContainer.tsx` com `container mx-auto px-[13px]` + `max-w-4xl mx-auto`, e trocar os wrappers externos das páginas em `src/pages/**` por ele (ou ajustar as classes direto quando o wrapper tiver lógica própria).
- Grades internas (ex.: `md:grid-cols-3`) ficam iguais; se alguma página larga perder colunas, ajusto para caber nos 896px.
- Registrar a regra em AGENTS.md.
