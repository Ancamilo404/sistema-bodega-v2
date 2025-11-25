// src/lib/cache.ts
// Simple in-memory cache con TTL

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, CacheEntry<any>>();

/**
 * Obtener valor del cache si es válido (no expirado)
 * @param key - Clave del cache
 * @param ttlSeconds - Tiempo de vida en segundos (default: 60)
 */
export function cacheGet<T>(key: string, ttlSeconds: number = 60): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  const age = (now - entry.timestamp) / 1000; // en segundos

  if (age > ttlSeconds) {
    cache.delete(key); // Expirado, eliminar
    return null;
  }

  return entry.data as T;
}

/**
 * Guardar valor en cache
 */
export function cacheSet<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Limpiar cache completo
 */
export function cacheClear(): void {
  cache.clear();
}

/**
 * Patrón: Ejecutar función con cache
 * Si está en cache, devolver cache
 * Si NO está, ejecutar fn, guardar cache y devolver
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  // 1. Intentar leer del cache
  const cached = cacheGet<T>(key, ttlSeconds);
  if (cached !== null) {
    return cached;
  }

  // 2. NO está en cache, ejecutar función
  const result = await fn();

  // 3. Guardar resultado en cache
  cacheSet(key, result);

  return result;
}
