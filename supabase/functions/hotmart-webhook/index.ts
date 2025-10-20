import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HOTMART_PRODUCTS = {
  '6471522': { 
    type: 'monthly', 
    months: 1, 
    name: 'Plano Mensal',
    tier: 'Premium Mensal'
  },
  '6471543': { 
    type: 'annual', 
    months: 12, 
    name: 'Plano Anual',
    tier: 'Premium Anual'
  }
} as const;

interface HotmartWebhook {
  event: string;
  data: {
    product?: {
      id: number | string;
      ucode?: string;
      name: string;
    };
    buyer?: {
      name: string;
      email: string;
    };
    purchase?: {
      transaction: string;
      status: string;
    };
    subscription?: {
      subscriber?: {
        code: string;
      };
    };
    subscriber?: {
      code: string;
    };
  };
}

// Função auxiliar para extrair transaction ID de forma segura
function extractTransactionId(webhook: HotmartWebhook): string | null {
  const locations = [
    webhook.data?.purchase?.transaction,
    webhook.data?.subscription?.subscriber?.code,
    webhook.data?.subscriber?.code,
  ];
  
  for (const location of locations) {
    if (location && typeof location === 'string') {
      return location;
    }
  }
  
  return null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhook: HotmartWebhook = await req.json();
    console.log('📨 Webhook recebido:', JSON.stringify(webhook, null, 2));

    // Validar estrutura básica do webhook
    if (!webhook.event || !webhook.data) {
      console.error('❌ Payload inválido: estrutura básica ausente');
      return new Response(
        JSON.stringify({ error: 'Payload inválido' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { event, data } = webhook;
    
    // Extrair transaction ID de forma segura
    const transactionId = extractTransactionId(webhook);
    if (!transactionId) {
      console.error('❌ Transaction ID não encontrado no payload');
      return new Response(
        JSON.stringify({ error: 'Transaction ID ausente' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('🔑 Transaction ID:', transactionId);

    // Processar eventos de cancelamento/reembolso PRIMEIRO (não requer validação de campos)
    if (event === 'SUBSCRIPTION_CANCELLATION' || event === 'PURCHASE_REFUNDED') {
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({ 
          subscribed: false,
          subscription_end: new Date().toISOString()
        })
        .eq('hotmart_transaction_id', transactionId);

      if (updateError) {
        console.error('❌ Erro ao cancelar assinatura:', updateError);
        throw updateError;
      }

      console.log('✅ Assinatura cancelada:', transactionId);

      return new Response(
        JSON.stringify({ success: true, message: 'Assinatura cancelada' }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar idempotência (apenas para eventos de compra)
    const { data: existingToken } = await supabase
      .from('registration_tokens')
      .select('id')
      .eq('hotmart_transaction_id', transactionId)
      .single();

    if (existingToken) {
      console.log('⚠️ Transação já processada:', transactionId);
      return new Response(
        JSON.stringify({ message: 'Transação já processada' }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Processar eventos de compra aprovada
    if (event === 'PURCHASE_COMPLETE' || event === 'PURCHASE_APPROVED') {
      // Validar campos obrigatórios para eventos de compra
      // Aceitar product.id = 0 (enviado pela Hotmart em testes)
      if ((data.product?.id === undefined && !data.product?.ucode) || !data.buyer?.email || !data.buyer?.name) {
        console.error('❌ Campos obrigatórios ausentes para evento de compra');
        return new Response(
          JSON.stringify({ error: 'Dados de compra incompletos' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Tentar usar ucode primeiro
      const productId = String(data.product.ucode || data.product.id);
      const buyerEmail = data.buyer.email;
      const buyerName = data.buyer.name;
      
      let planConfig = HOTMART_PRODUCTS[productId as keyof typeof HOTMART_PRODUCTS];
      
      // Se não encontrou pelo ucode, tentar pelo ID numérico como fallback
      if (!planConfig && data.product.id !== undefined && data.product.id !== null) {
        const numericId = String(data.product.id);
        planConfig = HOTMART_PRODUCTS[numericId as keyof typeof HOTMART_PRODUCTS];
        console.log(`🔄 Produto não encontrado por ucode, tentando por ID numérico: ${numericId}`);
      }
      
      if (!planConfig) {
        console.error('❌ Produto desconhecido:', { 
          ucode: data.product.ucode, 
          id: data.product.id 
        });
        return new Response(
          JSON.stringify({ error: 'Produto não configurado' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calcular data de expiração da assinatura
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + planConfig.months);

      // Calcular expiração do token (7 dias)
      const tokenExpiry = new Date();
      tokenExpiry.setDate(tokenExpiry.getDate() + 7);

      // Criar token de registro
      const { data: newToken, error: tokenError } = await supabase
        .from('registration_tokens')
        .insert({
          email: buyerEmail,
          name: buyerName,
          hotmart_transaction_id: transactionId,
          hotmart_product_id: productId,
          plan_type: planConfig.type,
          plan_months: planConfig.months,
          subscription_end: subscriptionEnd.toISOString(),
          expires_at: tokenExpiry.toISOString(),
        })
        .select()
        .single();

      if (tokenError) {
        console.error('❌ Erro ao criar token:', tokenError);
        throw tokenError;
      }

      console.log('✅ Token criado:', newToken.token);

      // Enviar email via Resend
      const registrationUrl = `https://app.dietainteligente.app/auth?token=${newToken.token}`;
      
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete seu cadastro - DietaInteligente</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Bem-vindo ao DietaInteligente!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá <strong>${buyerName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Sua compra do <strong>${planConfig.name}</strong> foi confirmada! 🎊
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Para começar a usar o aplicativo, clique no botão abaixo e finalize seu cadastro:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${registrationUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                      ✅ Finalizar Cadastro
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; color: #065f46; font-size: 14px; font-weight: bold;">
                      📋 Detalhes da sua assinatura:
                    </p>
                    <p style="margin: 0 0 5px; color: #047857; font-size: 14px;">
                      <strong>Plano:</strong> ${planConfig.name}
                    </p>
                    <p style="margin: 0 0 5px; color: #047857; font-size: 14px;">
                      <strong>Duração:</strong> ${planConfig.months} ${planConfig.months === 1 ? 'mês' : 'meses'}
                    </p>
                    <p style="margin: 0; color: #047857; font-size: 14px;">
                      <strong>Válido até:</strong> ${new Date(subscriptionEnd).toLocaleDateString('pt-BR')}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0; color: #92400e; font-size: 13px;">
                      ⚠️ <strong>Importante:</strong> Este link é válido por 7 dias e pode ser usado apenas uma vez. Não compartilhe com outras pessoas.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                Se o botão não funcionar, copie e cole este link no navegador:
              </p>
              <p style="margin: 0 0 20px; color: #3b82f6; font-size: 13px; word-break: break-all;">
                ${registrationUrl}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px;">
                DietaInteligente - Sua jornada fitness começa aqui! 💪
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Se você não realizou esta compra, ignore este email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const emailResponse = await resend.emails.send({
        from: 'DietaInteligente <caiofigueiredoroberto@caioroberto.com>',
        to: [buyerEmail],
        subject: `🎉 Complete seu cadastro - ${planConfig.name}`,
        html: emailHtml,
      });

      console.log('📧 Email enviado:', emailResponse);

      return new Response(
        JSON.stringify({ 
          success: true, 
          token: newToken.token,
          message: 'Token criado e email enviado'
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Processar reativação
    if (event === 'SUBSCRIPTION_REACTIVATION') {
      const planConfig = HOTMART_PRODUCTS[productId as keyof typeof HOTMART_PRODUCTS];
      
      if (planConfig) {
        const subscriptionEnd = new Date();
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + planConfig.months);

        const { error: updateError } = await supabase
          .from('subscribers')
          .update({ 
            subscribed: true,
            subscription_end: subscriptionEnd.toISOString()
          })
          .eq('hotmart_transaction_id', transactionId);

        if (updateError) {
          console.error('❌ Erro ao reativar assinatura:', updateError);
          throw updateError;
        }

        console.log('✅ Assinatura reativada:', transactionId);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Assinatura reativada' }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Evento não tratado
    console.log('⚠️ Evento não tratado:', event);
    return new Response(
      JSON.stringify({ message: 'Evento não processado' }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('❌ Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
