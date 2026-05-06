# Liberar /profile/diets para usuários Free

## Objetivo
Remover o gate `ProRoute` da rota `/profile/diets` para que usuários do plano gratuito também consigam acessar a página "Minhas Dietas".

## Arquivo a alterar
- `src/App.tsx` (linha 103)

## Mudança
Trocar:
```tsx
<Route path="/profile/diets" element={<ProRoute feature="profile-diets"><MyDiets /></ProRoute>} />
```
Por:
```tsx
<Route path="/profile/diets" element={<MyDiets />} />
```

## Fora do escopo
- Não mexer nas demais rotas Pro (graficos-progresso, fit-tracker, masterchef, receitas, nutri-coach, apple-health, hidratacao, jejum, objetivos, sono, faca-em-casa, provador, treinos, whatsapp-settings).
- Não alterar conteúdo da página `MyDiets` em si.
