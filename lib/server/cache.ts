// In-memory cache for events with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

const CACHE_TTL = 60 * 1000; // 60 seconds

export function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
  console.log(`[Cache] Set cache for key: ${key}`);
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  
  if (!entry) {
    console.log(`[Cache] Cache miss for key: ${key}`);
    return null;
  }

  const age = Date.now() - entry.timestamp;
  
  if (age > CACHE_TTL) {
    cache.delete(key);
    console.log(`[Cache] Cache expired for key: ${key}`);
    return null;
  }

  console.log(`[Cache] Cache hit for key: ${key} (age: ${age}ms)`);
  return entry.data as T;
}

export function getCacheMetadata(key: string): { lastFetchedAt: number; ageMs: number } | null {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }

  const ageMs = Date.now() - entry.timestamp;
  return {
    lastFetchedAt: entry.timestamp,
    ageMs,
  };
}

export function clearCache(key: string): void {
  cache.delete(key);
  console.log(`[Cache] Cleared cache for key: ${key}`);
}
