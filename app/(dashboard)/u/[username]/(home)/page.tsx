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
    redirect(`/u/${username}`);
  }

  const externalUser = await getUser();

  const user = await getUserByUsername(username);

  if (user?.externalUserId !== externalUser?.id || !user?.stream) {
    redirect("/");
  }

  return (
    <div className="h-full">
      <StreamPlayer user={user} stream={user.stream!} isFollowing />
    </div>
  );
}
