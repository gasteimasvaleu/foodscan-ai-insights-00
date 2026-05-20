export const formatBRL = (centavos: number): string =>
  (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Sanitiza um telefone para o formato esperado pelo wa.me (apenas dígitos). */
export const cleanPhone = (raw: string): string => raw.replace(/\D+/g, "");

/** Valida formato E.164-ish: DDI+DDD+número, 10-15 dígitos. */
export const isValidWhatsApp = (raw: string): boolean => {
  const d = cleanPhone(raw);
  return d.length >= 10 && d.length <= 15;
};
