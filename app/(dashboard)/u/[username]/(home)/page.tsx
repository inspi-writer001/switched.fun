import { getUser } from "@civic/auth-web3/nextjs";

import { getUserByUsernameFromApi } from "@/lib/user-service";
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

  const user = await getUserByUsernameFromApi(username);

  // Only allow access if the user is accessing their own creator page
  if (user?.externalUserId !== externalUser?.id) {
    redirect("/");
  }

  // If user doesn't have a stream, redirect to keys page to set up streaming
  if (!user?.stream) {
    redirect(`/u/${username}/keys`);
  }

  return (
    <div className="h-full">
      <StreamPlayer user={user} stream={user.stream!} isFollowing />
    </div>
  );
}
