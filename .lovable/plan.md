

## Confirmação de refeição no WhatsApp com escolha do tipo

Hoje a foto vira sempre `meal_type = 'outro'`. Vou adicionar fluxo de 2 etapas (confirmar → escolher tipo) **mantendo o registro completo de macros já existente** (calorias, proteínas, carboidratos, gorduras). A única coisa que muda no `INSERT` em `meal_records` é o `meal_type`.

### Novo rodapé da mensagem após análise da foto
Em `whatsapp-process-image/index.ts`:
```
✅ Quer registrar esta refeição?
1️⃣ SIM — registrar agora
2️⃣ TROCAR — escolher outro tipo de refeição
3️⃣ NÃO — cancelar
```

O `pending_meal` salvo em `whatsapp_messages.metadata` continua com **todos os macros** já gravados hoje (`food_name`, `calories`, `proteins`, `carbohydrates`, `fats`, `portion`, `meal_time`) e ganha dois novos campos:
- `meal_type_inferred` — calculado pelo horário BRT atual.
- `awaiting: 'confirm'` — estado da conversa.

Mapeamento de horário → tipo:
- 04:00–10:30 → `cafe_da_manha`
- 10:30–14:30 → `almoco`
- 14:30–17:30 → `lanche`
- 17:30–21:30 → `jantar`
- 21:30–04:00 → `ceia`

### Tratamento dos comandos em `whatsapp-process-text/index.ts`

1. **SIM / S / 1** (estado `awaiting: 'confirm'`)
   - Insert em `meal_records` com **todos os campos atuais preservados** (`food_name`, `calories`, `proteins`, `carbohydrates`, `fats`, `portion`, `meal_time`, `user_id`) + `meal_type = pending_meal.meal_type_inferred`.
   - Resposta: `✅ Registrada como {tipo legível}! 🔥 {kcal} kcal • 💪 {prot}g • 🍞 {carbs}g • 🥑 {fats}g`.
   - Limpa `pending_meal`.

2. **TROCAR / T / 2** (estado `awaiting: 'confirm'`)
   - Atualiza metadata da última mensagem para `awaiting: 'meal_type'` (preservando `pending_meal` completo com todos os macros).
   - Envia menu:
     ```
     🍽️ Qual o tipo desta refeição?
     1️⃣ Café da manhã
     2️⃣ Lanche
     3️⃣ Almoço
     4️⃣ Jantar
     5️⃣ Ceia
     ```

3. **1–5 ou nome do tipo** (estado `awaiting: 'meal_type'`)
   - Mapeia para `cafe_da_manha | lanche | almoco | jantar | ceia` (aceita também "café", "cafe", "lanche", "almoço", "almoco", "jantar", "ceia").
   - Insert em `meal_records` com **todos os macros do `pending_meal`** + `meal_type` escolhido.
   - Se não bater, devolve o menu novamente.

4. **NÃO / N / 3** — comportamento atual mantido (cancela).

### Garantia explícita sobre macros
O insert continuará exatamente assim (sem remover nenhum campo nutricional):
```ts
await supabase.from('meal_records').insert({
  user_id,
  food_name: meal.food_name,
  calories: meal.calories,
  proteins: meal.proteins,
  carbohydrates: meal.carbohydrates,
  fats: meal.fats,
  portion: meal.portion,
  meal_time: meal.meal_time,
  meal_type: chosenOrInferredType, // <-- ÚNICA mudança
});
```

### Detecção de estado
A busca em `whatsapp_messages` passa a checar também `metadata.awaiting` (`confirm` ou `meal_type`), mantendo `.order('created_at', desc).limit(1).maybeSingle()`.

### Textos de menu/ajuda
Atualizados para citar **TROCAR** e o fluxo numérico 1/2/3.

### Arquivos afetados (apenas edge functions)
- `supabase/functions/whatsapp-process-image/index.ts` — calcular `meal_type_inferred`, salvar `awaiting: 'confirm'`, novo rodapé.
- `supabase/functions/whatsapp-process-text/index.ts` — branch `awaiting: 'meal_type'`, comando TROCAR, uso do `meal_type` correto no insert (mantendo todos os macros), atualização dos textos de menu/ajuda.

### Sem mudanças de banco
`meal_records.meal_type` (text) já aceita os valores usados no app. Nenhuma migration necessária.

### Fora do escopo
- Botões interativos do Twilio (Content Templates).
- Trocar provedor para Z-API.
- Qualquer alteração nos campos de macros gravados.

