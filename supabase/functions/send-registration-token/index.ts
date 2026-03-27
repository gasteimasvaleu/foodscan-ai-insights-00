import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_CONFIG = {
  'monthly': { months: 1, name: 'Plano Mensal', tier: 'Premium Mensal' },
  'annual': { months: 12, name: 'Plano Anual', tier: 'Premium Anual' },
} as const;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validar autenticação (service_role ou admin)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se é admin
    const { data: hasAdminRole } = await supabase.rpc('has_role', {
      _user_id: userData.user.id,
      _role: 'admin'
    });

    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, name, plan_type } = await req.json();

    if (!email || !name || !plan_type) {
      return new Response(
        JSON.stringify({ error: 'email, name e plan_type são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const planConfig = PLAN_CONFIG[plan_type as keyof typeof PLAN_CONFIG];
    if (!planConfig) {
      return new Response(
        JSON.stringify({ error: 'plan_type inválido. Use: monthly ou annual' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('📝 Criando token para:', { email, name, plan_type });

    // Calcular datas
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + planConfig.months);

    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 7);

    // Criar token de registro
    const { data: newToken, error: tokenError } = await supabase
      .from('registration_tokens')
      .insert({
        email,
        name,
        plan_type: planConfig.tier === 'Premium Mensal' ? 'monthly' : 'annual',
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
  <title>Complete seu cadastro - We Diet</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Bem-vindo ao We Diet!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Seu acesso ao <strong>${planConfig.name}</strong> foi liberado! 🎊
              </p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Para começar a usar o aplicativo, clique no botão abaixo e finalize seu cadastro:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${registrationUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                      ✅ Finalizar Cadastro
                    </a>
                  </td>
                </tr>
              </table>
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
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px;">
                We Diet - Sua jornada fitness começa aqui! 💪
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Se você não solicitou este acesso, ignore este email.
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
      from: 'We Diet <contato@dietainteligente.app>',
      to: [email],
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

  } catch (error: any) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
