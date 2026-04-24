

## Trocar modelo do Provador para Nano Banana 2

O `google/gemini-2.5-flash-image` continuou ignorando a IMAGE B mesmo após o ajuste de payload e prompt. Vamos subir para o `google/gemini-3.1-flash-image-preview` (Nano Banana 2), que segue instruções multi-imagem com bem mais fidelidade — exatamente o que precisamos para o provador virtual.

### Mudança

Em `supabase/functions/virtual-tryon/index.ts`, trocar:

```ts
model: "google/gemini-2.5-flash-image",
```

por:

```ts
model: "google/gemini-3.1-flash-image-preview",
```

Nada mais muda: payload intercalado (texto + imagem A + texto + imagem B + prompt), `modalities: ["image", "text"]`, bucket `provador`, fluxo de upload e UI 1:1 permanecem idênticos.

### Memória a atualizar
- `mem://features/provador/core` — registrar que o modelo agora é `google/gemini-3.1-flash-image-preview` (Nano Banana 2), motivo: fidelidade superior em prompts multi-imagem.

### Validação
Após deploy, você testa em `/provador` com as mesmas duas fotos. Esperado: pessoa da IMAGE A vestindo a roupa da IMAGE B, fundo branco de estúdio, 1:1.

### Observações
- Custo por imagem é maior que a 2.5-flash-image, mas ainda rápido. Se virar gargalo, dá pra adicionar paywall/limite por usuário em uma próxima iteração (fora do escopo agora).
- Se mesmo assim a fidelidade da roupa não for boa o suficiente, próxima opção seria `google/gemini-3-pro-image-preview` (Nano Banana Pro) — mais lento e caro, mas com qualidade máxima.

### Arquivos editados
- `supabase/functions/virtual-tryon/index.ts` — apenas a string do modelo.

### Fora do escopo
- Mudar prompt, payload, UI ou bucket.
- Adicionar histórico/galeria.
- Paywall ou limite de uso.

