

# Renomear App de "FoodScan & Diet" / "FoodScan AI" para "We Diet"

## Escopo

Trocar todas as ocorrencias visiveis do nome do app para "We Diet", mantendo rotas e nomes internos de componentes inalterados.

## Arquivos a alterar

### 1. Frontend - Textos visiveis (12 arquivos)

| Arquivo | O que muda |
|---|---|
| `src/components/Header.tsx` | "FoodScan & Diet" → "We Diet" |
| `src/components/Navbar.tsx` | "FoodScan & Diet" → "We Diet" |
| `src/components/Footer.tsx` | "FoodScan & Diet" → "We Diet" |
| `src/components/SplashScreen.tsx` | "FoodScan AI" → "We Diet", alt da imagem |
| `src/components/PWAInstallPrompt.tsx` | "FoodScan AI" → "We Diet" (2 ocorrencias) |
| `src/components/FAQSection.tsx` | "FoodScan & Diet" → "We Diet" |
| `src/components/TestimonialsSection.tsx` | "FoodScan & Diet" → "We Diet" |
| `src/components/PaymentRegistrationForm.tsx` | "FoodScan & Diet" → "We Diet" (3 ocorrencias) |
| `src/pages/About.tsx` | Todas as menções → "We Diet" |
| `src/pages/Subscription.tsx` | "FoodScan & Diet" → "We Diet" |
| `src/pages/PaymentSuccess.tsx` | "FoodScan & Diet" → "We Diet" |
| `src/pages/FoodScan.tsx` | "FoodScan" (titulo da pagina) → manter pois é o nome da feature, nao do app. Apenas trocar "acessar o FoodScan" se referenciar o app |
| `src/pages/ServiNUTRI.tsx` | "FoodScan & Diet" → "We Diet" |

### 2. PWA / HTML (3 arquivos)

| Arquivo | O que muda |
|---|---|
| `index.html` | title, meta tags (og, twitter, apple-mobile-web-app-title, application-name, author) |
| `public/manifest.json` | name, short_name |
| `public/offline.html` | title |

### 3. Backend - Edge Functions (1 arquivo)

| Arquivo | O que muda |
|---|---|
| `supabase/functions/hotmart-webhook/index.ts` | Textos de email: titulo, saudacao, rodape, remetente |

### O que NAO muda

- Rotas (`/foodscan`, `/food-scan`) - permanecem iguais
- Nomes de componentes/arquivos (`FoodScan.tsx`, etc.)
- Nome do feature "FoodScan" dentro da pagina de scan (é o nome da funcionalidade)
- Assets/logos (continua usando a mesma imagem)
- URLs do Supabase, dominio publicado
- `send-notification/index.ts` - URLs hardcoded do dominio antigo (precisaria atualizar separadamente)

## Ordem de execução

1. Alterar todos os arquivos frontend de uma vez (substituicao de texto)
2. Alterar `index.html`, `manifest.json`, `offline.html`
3. Alterar edge function `hotmart-webhook` e fazer deploy

