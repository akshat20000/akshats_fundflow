import { redis } from '@/lib/Redis';

export const TTL = {
  PROFILE:      60,
  TRANSACTIONS: 30,
  CONTACTS:     300,
  GROUPS:       60,
};

export const Keys = {
  profile:      (userId) => `ff:profile:${userId}`,
  transactions: (userId) => `ff:transactions:${userId}`,
  contacts:     (userId) => `ff:contacts:${userId}`,
  groups:       (userId) => `ff:groups:${userId}`,
};

export async function getOrFetch(Key, fetchFn, ttl) {
  // If Redis not configured, just fetch directly
  if (!redis) return await fetchFn();

  try {
    const cached = await redis.get(Key);
    if (cached !== null) {
      return cached;
    }
    const fresh = await fetchFn();
    if (fresh !== null && fresh !== undefined) {
      await redis.setex(Key, ttl, JSON.stringify(fresh));
    }
    return fresh;
  } catch (err) {
    return await fetchFn();
  }
}

export async function invalidate(...cacheKeys) {
  if (!redis || cacheKeys.length === 0) return;
  try {
    await redis.del(...cacheKeys);
  } catch (err) {
  }
}