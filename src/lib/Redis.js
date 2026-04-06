import {Redis} from '@upstash/redis';

const url   = import.meta.env.VITE_UPSTASH_REDIS_REST_URL;
const token = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN;

export const redis = (url && token)
  ? new Redis({ url, token })
  : null;

// if (!redis) {
//   console.warn('[redis] Redis env vars missing — caching disabled, using Supabase directly.');
// }