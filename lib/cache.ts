import { redis } from "./redis"

export async function getCachedData<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = await redis.get<T>(key)
    if (cached) return cached
    
    const data = await fetchFn()
    await redis.set(key, data, { ex: 3600 }) // 1 hour expiry
    return data
  }