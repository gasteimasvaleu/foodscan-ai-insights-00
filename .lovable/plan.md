## Objetivo
Reposicionar a badge `18:6` para a direita do card, alinhada com a borda direita do botão "Encerrar jejum", mantendo a mesma altura vertical (mesma linha do número grande do tempo).

## Mudança em `src/components/DailyFastingSummaryCard.tsx`

### Remover a badge de dentro do flex inline (linhas 185-192)
A badge hoje fica colada ao número do tempo dentro de um `flex items-center gap-2`. Vou tirá-la do flex e renderizar separadamente.

De:
```tsx
<div className="flex items-center gap-2">
  <span className="text-white text-3xl font-black leading-none tracking-tight">
    {goalReached ? formatTime(elapsedHours) : formatTime(remainingHours)}
  </span>
  <span className="text-white text-sm font-bold bg-white/25 rounded-full px-2.5 py-1 leading-none">
    {protocol}
  </span>
</div>
```

Para (sem a badge inline):
```tsx
<span className="text-white text-3xl font-black leading-none tracking-tight">
  {goalReached ? formatTime(elapsedHours) : formatTime(remainingHours)}
</span>
```

### Adicionar a badge absoluta no canto superior direito do card
Inserir logo após o header (após linha 155), dentro do container raiz do card (que já é `relative`):
```tsx
{isFasting && (
  <span className="absolute right-3 top-9 text-white text-sm font-bold bg-white/25 rounded-full px-2.5 py-1 leading-none z-10">
    {protocol}
  </span>
)}
```

- `right-3` casa com o `px-3` do card → fica alinhada exatamente onde termina o botão "Encerrar jejum" (que é `w-full` dentro do mesmo padding).
- `top-9` posiciona verticalmente na mesma altura do número grande de horas (header de ~22px + mb-1.5 + meio do bloco hero).

## Fora do escopo
- Sem alteração no botão, no anel, na fase ou no texto secundário.
- Sem alteração de fonte, cor ou conteúdo da badge.
