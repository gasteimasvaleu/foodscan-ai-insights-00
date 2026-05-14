## Diagnóstico
O hero atual da `QuizResult.tsx` usa gradiente magenta sólido com texto branco. O usuário quer seguir o padrão visual do card "Sua sequência" de `/conquistas` (referência no screenshot): card branco, borda `#FFD1E7`, blobs decorativos, ícone em quadrado arredondado com gradiente rosa, número grande em preto ao lado, barra de progresso fina com gradiente rosa e rodapé motivacional separado por linha.

## Mudanças em `src/pages/QuizResult.tsx`

Substituir o hero card (atualmente gradient magenta) por uma estrutura espelhando o card de `Conquistas.tsx` (linhas 102-177), mantendo a animação de count-up e o conteúdo do quiz:

### Estrutura do novo card
```
<div className="relative overflow-hidden rounded-[32px] bg-white border border-[#FFD1E7] shadow-xl shadow-pink-100 p-6">
  {/* Blobs */}
  <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FFD1E7] rounded-full blur-3xl opacity-50" />
  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#FD46A1] rounded-full blur-3xl opacity-10" />

  <div className="relative z-10">
    {/* Header */}
    <h3>Seu resultado</h3>
    <p className="text-[#FD46A1] uppercase">Quiz concluído</p>
    {is_perfect && <chip "QUIZ PERFEITO" com Sparkles>}

    {/* Score visual — espelha Streak visual */}
    <div className="flex items-center gap-5 mb-6">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FD46A1] to-[#ff7eb3] shadow-lg shadow-pink-200 flex items-center justify-center">
        <Trophy className="h-12 w-12 text-white" fill="white" />
      </div>
      {isPro && <chip "BÔNUS PRO" abaixo do ícone>}
      <div className="flex flex-col">
        <span className="text-5xl font-extrabold text-foreground tabular-nums">
          {Math.round(animatedScore)}
        </span>
        <span className="text-sm text-muted-foreground">pontos</span>
      </div>
    </div>

    {/* Progresso de acertos */}
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <p className="text-xs font-semibold">Acertos: <span className="text-[#FD46A1]">{correct} de {total}</span></p>
        <p className="text-[10px] font-bold text-muted-foreground">{Math.round(progress)}%</p>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
        <div className="h-full bg-gradient-to-r from-[#FD46A1] to-[#ff8cb8] rounded-full shadow-[0_0_8px_rgba(253,70,161,0.4)] transition-all duration-700"
             style={{ width: `${progress}%` }} />
      </div>
    </div>

    {/* Footer motivacional */}
    <div className="pt-4 mt-4 border-t border-gray-100">
      <p className="text-[13px] text-muted-foreground font-medium">
        {is_perfect
          ? "Pontuação perfeita! Você dominou o tema 🏆"
          : pct >= 70
            ? "Ótimo desempenho — continue jogando para subir no ranking!"
            : "Bom começo! Tente outro quiz para somar mais pontos."}
      </p>
    </div>
  </div>
</div>
```

### Cards seguintes (manter)
- Upsell Pro card (sem mudança).
- Botões de próximos passos (sem mudança).

### Imports
- Remover `Target` (não é mais usado), manter `Trophy`, `Crown`, `Sparkles`, `ArrowRight`.

## Fora do escopo
- Lógica de cálculo, queries, ranking, edge functions.
- Demais páginas do quiz.
