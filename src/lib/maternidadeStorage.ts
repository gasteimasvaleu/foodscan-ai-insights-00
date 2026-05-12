// Tiny localStorage wrapper namespaced per user for maternity features
const PREFIX = 'wediet:mat';

const key = (userId: string | undefined, suffix: string) =>
  `${PREFIX}:${userId ?? 'anon'}:${suffix}`;

export function matGet<T>(userId: string | undefined, suffix: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(userId, suffix));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function matSet<T>(userId: string | undefined, suffix: string, value: T) {
  try {
    localStorage.setItem(key(userId, suffix), JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}
