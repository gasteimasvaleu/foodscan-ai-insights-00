import { openExternalUrl } from "@/lib/openExternal";
import { supabase } from "@/integrations/supabase/client";
import { cleanPhone, formatBRL, normalizeCidade } from "./formatters";
import type { MFCartItem, MFLoja } from "./types";
import type { MFEntregador } from "./entregador-types";

interface DeliveryRequestArgs {
  entregador: MFEntregador;
  loja: MFLoja;
  clienteId: string;
  clienteNome?: string;
  telefoneCliente?: string;
  endereco: string;
  cidade: string;
  estado?: string;
  itens: MFCartItem[];
  totalCentavos: number;
  orderLogId?: string;
  taxaOverrideCentavos?: number;
}


export async function sendDeliveryRequestToWhatsApp(args: DeliveryRequestArgs): Promise<void> {
  const { entregador, loja, clienteId, clienteNome, telefoneCliente, endereco, cidade, estado, itens, totalCentavos, orderLogId, taxaOverrideCentavos } = args;
  const enderecoLoja = [loja.endereco?.rua, loja.endereco?.bairro, loja.endereco?.cidade].filter(Boolean).join(", ");
  const taxa = taxaOverrideCentavos ?? (loja as any).taxa_entrega_padrao_centavos ?? 0;
  const uf = estado?.trim().toUpperCase() || null;
  const cidadeUf = uf ? `${cidade} - ${uf}` : cidade;

  // Cria mf_entrega (não bloqueia o WhatsApp se falhar)
  const { error } = await supabase.from("mf_entregas").insert({
    loja_id: loja.id,
    lojista_id: loja.owner_id,
    cliente_id: clienteId,
    endereco_entrega: endereco,
    cidade: normalizeCidade(cidade),
    estado: uf,
    taxa_centavos: taxa,
    status: "disponivel",
    tipo: "app",
    telefone_cliente: telefoneCliente ?? null,
    telefone_lojista: loja.telefone_whatsapp ?? null,
    ...(orderLogId ? { order_log_id: orderLogId } : {}),
  });
  if (error) console.warn("[mf_entregas] insert:", error.message);

  const linhas = itens.slice(0, 8).map((i) => `• ${i.quantidade}x ${i.nome}`);
  const msg = [
    `🛵 Olá, ${entregador.nome_completo.split(" ")[0]}! Tudo bem?`,
    ``,
    `Tenho um pedido pronto na loja *${loja.nome}*${enderecoLoja ? ` (${enderecoLoja})` : ""}.`,
    `Preciso entregar em: *${endereco}* — ${cidadeUf}.`,

    ``,
    `Itens:`,
    ...linhas,
    itens.length > 8 ? `…e mais ${itens.length - 8} item(ns)` : null,
    ``,
    `Valor estimado do pedido: ${formatBRL(totalCentavos)}`,
    taxa > 0 ? `Taxa de entrega sugerida pela loja: ${formatBRL(taxa)}` : null,
    entregador.taxa_min_centavos || entregador.taxa_max_centavos
      ? `Sua faixa de entrega cadastrada: ${
          entregador.taxa_min_centavos && entregador.taxa_max_centavos && entregador.taxa_min_centavos !== entregador.taxa_max_centavos
            ? `${formatBRL(entregador.taxa_min_centavos)} – ${formatBRL(entregador.taxa_max_centavos)}`
            : formatBRL(entregador.taxa_min_centavos || entregador.taxa_max_centavos)
        }. Você confirma?`
      : null,
    ``,
    `Você tem interesse em pegar essa entrega? Combina por aqui que eu te passo todos os detalhes.${clienteNome ? `\n\n— ${clienteNome}` : ""}`,
  ].filter(Boolean).join("\n");

  const url = `https://wa.me/${cleanPhone(entregador.telefone_whatsapp)}?text=${encodeURIComponent(msg)}`;
  await openExternalUrl(url);
}

interface SendArgs {
  loja: MFLoja;
  itens: MFCartItem[];
  clienteId: string;
  clienteNome?: string;
  clienteLocal?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
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
      cliente_nome: args.clienteNome ?? null,
      cliente_endereco: args.endereco?.trim() || null,
      cliente_cidade: args.cidade?.trim() || null,
      cliente_estado: args.estado?.trim().toUpperCase() || null,
      cliente_telefone: args.telefone?.trim() || null,
    })

    .then(({ error }) => {
      if (error) console.warn("[mf_order_log] insert error:", error.message);
    });

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  await openExternalUrl(url);
}
