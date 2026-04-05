import { redis } from '@/lib/Redis';

export const TTL = {
  PROFILE: 60,
  TRANSACTIONS: 30,
  CONTACTS: 300,
  GROUPS: 60
};

export const Keys = {
  profile: (userId) => `ff:profile:${userId}`,
  transactions: (userId) => `ff:transactions:${userId}`,
  contacts: (userId) => `ff:contacts:${userId}`,
  groups: (userId) => `ff:groups:${userId}`,
};

/**
 * Get data from cache. If not found, call fetchFn to get it,
 * store it in cache with the given TTL, then return it.
 *
 * This pattern is called "cache-aside" or "lazy loading".
 *
 * @param {string} key     - Redis key
 * @param {Function} fetchFn - async function that fetches from Supabase
 * @param {number} ttl     - seconds to keep in cache
 */
export async function getOrFetch(key, fetchFn, ttl) {
  try {
    const cached = await redis.get(key);
    if (cached !== null) {
      console.log(`[cache] HIT  ${key}`);
      return cached; // Upstash automatically parses JSON
    }

    console.log(`[cache] MISS ${key}`);
    const fresh = await fetchFn();

    if (fresh !== null && fresh !== undefined) {
      await redis.setex(key, ttl, JSON.stringify(fresh));
    }

    return fresh;
  } catch (err) {
    console.warn(`[cache] Redis error for ${key} — falling back to Supabase:`, err.message);
    return await fetchFn();
  }
}

/**
 * Delete one or more cache keys.
 * Call this whenever data changes (after any mutation).
 */
export async function invalidate(...cacheKeys) {
  if (cacheKeys.length === 0) return;
  try {
    await redis.del(...cacheKeys);
    console.log(`[cache] INVALIDATED`, cacheKeys);
  } catch (err) {
    console.warn('[cache] Failed to invalidate keys:', err.message);
  }
}