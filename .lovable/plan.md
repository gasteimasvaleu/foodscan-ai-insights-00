

## Mostrar as 5 últimas análises com imagem no FoodScan

### 1. Migration — adicionar coluna `image_url` ao `meal_records`
```sql
ALTER TABLE public.meal_records ADD COLUMN image_url text;
```

### 2. Salvar imagem ao registrar refeição
- **`FoodNutritionResults.tsx`**: receber prop `imageUrl?: string` (a imagem base64/URL já selecionada no FoodScan)
- No `handleSaveMeal`, incluir `image_url: imageUrl` no insert
- **`FoodScan.tsx`**: ao chamar `<FoodNutritionResults>`, passar `imageUrl={selectedImage}` (já existe o state `selectedImage`)
- Upload da imagem para o bucket `assessments` antes do insert, usando `uploadToSupabase`, e salvar a URL pública resultante

### 3. Criar componente `RecentScans.tsx`
- Query: 5 últimos `meal_records` do usuário onde `image_url IS NOT NULL`, ordenado por `created_at DESC`
- Layout: scroll horizontal com cards compactos mostrando thumbnail arredondada, nome do alimento, calorias e horário relativo
- Estilo consistente com o app (rosa, cantos arredondados)

### 4. Integrar no FoodScan.tsx
- Renderizar `<RecentScans />` abaixo do card de `ImageUpload` (linha ~686), dentro do `space-y-8`
- Só aparece quando não há análise em andamento e não há resultados exibidos

### Arquivos modificados
| Arquivo | Ação |
|---|---|
| Migration SQL | Adicionar `image_url` |
| `src/components/FoodNutritionResults.tsx` | Receber `imageUrl`, upload e salvar |
| `src/components/RecentScans.tsx` | Novo componente |
| `src/pages/FoodScan.tsx` | Passar `imageUrl`, renderizar `RecentScans` |

