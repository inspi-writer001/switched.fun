import { Redis } from '@upstash/redis'
   
export const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
})

export type CacheConfig = {
  key: string
  ttl?: number // Time to live in seconds
}

export async function getCachedData<T>({
  key,
  ttl = 3600, // Default 1 hour
  fetchFn,
}: CacheConfig & {
  fetchFn: () => Promise<T>
}): Promise<T> {
  try {
    // Try to get from cache
    const cached = await redis.get<T>(key)
    if (cached) return cached

    // If not in cache, fetch and cache
    const data = await fetchFn()
    await redis.set(key, data, { ex: ttl })
    return data
  } catch (error) {
    console.error('Cache error:', error)
    // Fallback to direct fetch if cache fails
    return fetchFn()
  }
}

export async function invalidateCache(key: string) {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}