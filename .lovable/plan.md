

## Problema

A chamada `requestAuthorization` na linha 145 do `useHealthKit.ts` inclui tipos não suportados pelo plugin (`'sleep' as any`, `'heart_rate' as any`), o que faz a autorização falhar completamente e impede a conexão.

## Solução

Reverter o `requestAuthorization` para solicitar apenas os tipos que funcionavam antes (`steps`, `calories`, `weight`, `workouts`). Os dados de sono e frequência cardíaca podem ser lidos sem autorização explícita em alguns casos, ou simplesmente falharão silenciosamente nas funções individuais (que já têm try/catch).

### Alteração no `src/hooks/useHealthKit.ts`

**Linha 144-147** — Remover `'sleep' as any` e `'heart_rate' as any` do array `read`:

```ts
Health.requestAuthorization({
  read: ['steps', 'calories', 'weight', 'workouts' as any],
  write: ['calories'],
}),
```

Isso restaura o comportamento anterior que funcionava. As funções `getHeartRate` e `getSleepAnalysis` continuam existindo e tentarão ler os dados — se o iOS não tiver permissão, elas falham silenciosamente graças aos try/catch existentes.

