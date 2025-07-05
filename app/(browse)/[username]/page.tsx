import { notFound } from "next/navigation";

import { getUserByUsername } from "@/lib/user-service";
import { checkFollowStatusFromApi } from "@/lib/follow-service";
import { isBlockedByUser } from "@/lib/block-service";
import { StreamPlayer } from "@/components/stream-player";
import { getCachedData } from "@/lib/cache";

interface UserPageProps {
  params: {
    username: string;
  };
};

const UserPage = async ({
  params
}: UserPageProps) => {
  const user = await getUserByUsername(params.username);

  if (!user || !user?.stream) {
    notFound();
  }
  
  const isFollowing = await checkFollowStatusFromApi(user.id);
  const isBlocked = await isBlockedByUser(user.id);

  if (isBlocked) {
    notFound();
  }

  return ( 
    <StreamPlayer
      user={user}
      stream={user.stream}
      isFollowing={isFollowing}
    />
  );
}

export const revalidate = 60;

export default UserPage;