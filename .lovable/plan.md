

## Adicionar envio de convite via WhatsApp (Z-API)

### Contexto
O projeto atualmente usa Twilio para WhatsApp. Vamos criar uma nova edge function dedicada para enviar convites via Z-API, separada da `whatsapp-send` (Twilio).

### Alteracoes

#### 1. Criar edge function `supabase/functions/send-whatsapp-invite/index.ts`
- Recebe: `phone`, `name`, `plan_type`, `token`
- Valida admin (JWT)
- Monta mensagem formatada com o link `https://app.dietainteligente.app/auth?token={token}`
- Envia via Z-API usando `POST https://api.z-api.io/instances/{INSTANCE_ID}/token/{TOKEN}/send-text`
- Secrets necessarios: `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_SECURITY_TOKEN`

#### 2. Atualizar `src/pages/AdminSubscriptions.tsx`
- Adicionar campo opcional "WhatsApp" (numero de telefone)
- Adicionar toggle/checkbox "Enviar tambem por WhatsApp"
- Ao enviar: primeiro cria o token via `send-registration-token`, depois se WhatsApp marcado, chama `send-whatsapp-invite` passando o token retornado
- Adicionar icone MessageCircle do lucide

#### 3. Secrets
Precisarei que voce informe:
- **Instance ID** da Z-API
- **Token** da Z-API  
- **Security Token** (Client Token) da Z-API

Esses serao adicionados como secrets no Supabase antes de implementar.

### Mensagem WhatsApp (template)
```
🎉 Olá {name}!

Seu acesso ao *We Diet* foi liberado! 🎊

📋 *Plano:* {plan_name}
⏰ *Duração:* {months} {mês/meses}

Para começar, clique no link abaixo e finalize seu cadastro:
👉 {registration_url}

⚠️ Este link é válido por 7 dias e pode ser usado apenas uma vez.

💪 We Diet - Sua jornada fitness começa aqui!
```

### Sem alteracoes no banco
A edge function `send-registration-token` ja retorna o token criado. Usaremos esse token para montar o link e enviar via Z-API.

### Detalhes tecnicos
- A Z-API espera o numero no formato `55DDD9XXXXXXXX` (sem +, sem espacos)
- Endpoint: `POST https://api.z-api.io/instances/{instanceId}/token/{token}/send-text`
- Headers: `Client-Token: {security_token}`, `Content-Type: application/json`
- Body: `{ "phone": "55...", "message": "..." }`

