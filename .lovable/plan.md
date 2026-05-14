## Melhorar UX do card "Boas-vindas, {userName}!"

Arquivo: `src/components/AuthCard.tsx` (linhas 264–270). Mantém o tamanho do card (`p-4`, mesma altura visual) e o tamanho da fonte do nome (`text-sm`).

### Problemas atuais
- Texto único centralizado, sem hierarquia visual.
- Não usa o espaço horizontal disponível.
- Não dá nenhuma informação útil além do nome.
- Email completo aparece como "userName" quando o profile não tem nome (quebra/trunca).

### Proposta

Layout em 3 zonas dentro do mesmo card:

```text
[ AV ]   Bom dia,                    [ qua, 14 mai ]
         Diego!
```

1. **Avatar circular à esquerda** (`h-9 w-9 rounded-full bg-white/60`) com a inicial do nome em `text-primary font-bold`. Dá identidade pessoal sem aumentar a altura.
2. **Bloco central**:
   - Linha 1 (label): saudação dinâmica por hora — "Bom dia", "Boa tarde", "Boa noite" — em `text-[11px] text-foreground/60 leading-none`.
   - Linha 2 (nome): apenas o **primeiro nome** (split do `profileName` ou parte antes do `@` do email) em `text-sm font-semibold` (mesma fonte de antes), com `truncate`.
3. **Pill de data à direita**: dia da semana + data curta em pt-BR (`qua, 14 mai`) em `text-[10px] bg-white/50 rounded-full px-2 py-1`. Reforça o contexto diário do dashboard logo acima.

Tudo dentro de um `flex items-center gap-3` no `CardContent` atual. Nada de mudança de altura ou fonte do nome.

### Detalhes técnicos
- Helper inline `getGreeting()` baseado em `new Date().getHours()`.
- `firstName = (profileName ?? user.email ?? '').split(/[\s@]/)[0]`.
- `initial = firstName.charAt(0).toUpperCase()`.
- Data: `new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })`.
- Sem novos imports, sem mudanças de dados/RLS, sem alterar o restante do componente.

