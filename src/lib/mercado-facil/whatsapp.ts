import { openExternalUrl } from "@/lib/openExternal";
import { supabase } from "@/integrations/supabase/client";
import { cleanPhone, formatBRL } from "./formatters";
import type { MFCartItem, MFLoja } from "./types";

interface SendArgs {
  loja: MFLoja;
  itens: MFCartItem[];
  clienteId: string;
  clienteNome?: string;
  clienteLocal?: string;
}

export function buildOrderMessage({ loja, itens, clienteNome, clienteLocal }: SendArgs): string {
  const linhas = itens.map(
    (i) => `• ${i.quantidade}x ${i.nome} — ${formatBRL(i.preco_centavos * i.quantidade)}`,
  );
  const total = itens.reduce((s, i) => s + i.preco_centavos * i.quantidade, 0);

  return [
    `🛒 Pedido via Mercado Fácil — We Diet`,
    ``,
    `Loja: ${loja.nome}`,
    clienteNome ? `👤 ${clienteNome}` : null,
    clienteLocal ? `📍 ${clienteLocal}` : null,
    ``,
    `Itens:`,
    ...linhas,
    ``,
    `Total estimado: ${formatBRL(total)}`,
    ``,
    `(Aguardo confirmação de disponibilidade, frete e forma de pagamento por aqui.)`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendOrderToWhatsApp(args: SendArgs): Promise<void> {
  const phone = cleanPhone(args.loja.telefone_whatsapp);
  const message = buildOrderMessage(args);
  const total = args.itens.reduce((s, i) => s + i.preco_centavos * i.quantidade, 0);

  // Log não-bloqueante
  supabase
    .from("mf_order_log")
    .insert({
      cliente_id: args.clienteId,
      loja_id: args.loja.id,
      itens: args.itens.map((i) => ({
        produto_id: i.produto_id,
        nome: i.nome,
        quantidade: i.quantidade,
        preco_centavos: i.preco_centavos,
      })),
      total_estimado_centavos: total,
    })
    .then(({ error }) => {
      if (error) console.warn("[mf_order_log] insert error:", error.message);
    });

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  await openExternalUrl(url);
}
