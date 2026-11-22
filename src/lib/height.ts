/** Converte altura (cm ou metros) para cm. Retorna null se inválida (fora de 100–250 cm). */
export function normalizeHeightCm(h: unknown): number | null {
  const n = typeof h === 'string' ? parseFloat(h.replace(',', '.')) : Number(h);
  if (!n || !isFinite(n)) return null;
  const cm = n < 3 ? Math.round(n * 100) : n;
  return cm >= 100 && cm <= 250 ? cm : null;
}
