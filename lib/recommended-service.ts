import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export const getRecommended = async () => {
  // figure out who we are (null if not authenticated)
  let userId: string | null = null;

  try {
    const self = await getSelf();
    userId = self.id;
  } catch {
    userId = null;
  }

  // now fetch recommendations, but never throw
  try {
    return await db.user.findMany({
      where: userId
        ? {
            AND: [
              { NOT: { id: userId } },
              { NOT: { followedBy: { some: { followerId: userId } } } },
              { NOT: { blocking: { some: { blockedId: userId } } } },
            ],
          }
        : {},
      include: { stream: { select: { isLive: true } } },
      orderBy: [{ stream: { isLive: "desc" } }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.error("getRecommended failed:", err);
    return []; // ← fallback to empty list
  }
};
