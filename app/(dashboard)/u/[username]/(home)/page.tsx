import { getUser } from "@civic/auth-web3/nextjs";

import { getUserByUsername } from "@/lib/user-service";
import { StreamPlayer } from "@/components/stream-player";
import { redirect } from "next/navigation";

interface CreatorPageProps {
  params: {
    username: string;
  };
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  // 1. Canonicalize casing
  const raw = params.username;
  const username = raw.toLowerCase();
  if (raw !== username) {
    // redirect /u/TechWithGwin → /u/techwithgwin
    redirect(`/u/${username}/home`);
    return null;
  }

  try {
    // 2. Pull wallet/user info
    const externalUser = await getUser();

    // 3. Case‑insensitive lookup in user‑service
    const user = await getUserByUsername(username);

    // 4. Only let the “owner” view their own stream
    if (user.externalUserId !== externalUser?.id || !user.stream) {
      throw new Error("Unauthorized");
    }

    // 5. Render the player
    return (
      <div className="h-full">
        <StreamPlayer user={user} stream={user.stream} isFollowing />
      </div>
    );
  } catch (err) {
    console.error("CreatorPage Error:", err);
    // 6. Fallback redirect
    redirect("/");
    return null;
  }
}
