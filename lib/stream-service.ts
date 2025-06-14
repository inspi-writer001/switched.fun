import { Stream } from "@prisma/client"
import { db } from "@/lib/db"
import { getCachedData, invalidateCache } from "@/lib/redis"

export async function getStreamByUserId(userId: string) {
  return getCachedData({
    key: `stream:user:${userId}`,
    ttl: 300, // 5 minutes
    fetchFn: async () => {
      return db.stream.findUnique({
        where: { userId }
      })
    }
  })
}

export async function getStreamByUsername(username: string) {
  return getCachedData({
    key: `stream:username:${username}`,
    ttl: 300, // 5 minutes
    fetchFn: async () => {
      const user = await db.user.findUnique({
        where: { username },
        select: { id: true }
      })
      
      if (!user) return null
      
      return db.stream.findUnique({
        where: { userId: user.id }
      })
    }
  })
}

export async function updateStream(streamId: string, data: Partial<Stream>) {
  const stream = await db.stream.update({
    where: { id: streamId },
    data
  })
  
  // Invalidate related caches
  await Promise.all([
    invalidateCache(`stream:user:${stream.userId}`),
    invalidateCache(`stream:username:${stream.userId}`)
  ])
  
  return stream
}
