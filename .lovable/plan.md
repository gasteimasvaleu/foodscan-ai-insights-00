

## Corrigir label da badge de status nos ObjectiveCards

O texto "Meta ultrapassada ❌" está semanticamente errado. Deve ser "Meta não cumprida ❌", pois o usuário não atingiu/respeitou a meta — não a "ultrapassou".

### Alteração em `src/components/ObjectiveCard.tsx`

Linha 33: trocar:
```ts
const statusLabel = data.isWithinGoal ? 'Meta cumprida ✅' : 'Meta ultrapassada ❌';
```
por:
```ts
const statusLabel = data.isWithinGoal ? 'Meta cumprida ✅' : 'Meta não cumprida ❌';
```

