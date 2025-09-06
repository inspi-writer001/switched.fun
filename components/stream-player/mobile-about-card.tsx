import React from "react";
import { Header } from "./header";
import { InfoCard } from "./info-card";
import { AboutCard } from "./about-card";
import { CustomStream, CustomUser } from ".";

interface MobileAboutCardProps {
  user: CustomUser;
  identity: string;
  isFollowing: boolean;
  stream: CustomStream;
}


export const MobileAboutCard = ({ user, identity, isFollowing, stream }: MobileAboutCardProps) => {
  return (
    <>
      <Header
        hostName={user.username}
        hostIdentity={user.id}
        viewerIdentity={identity}
        imageUrl={user.imageUrl}
        isFollowing={isFollowing}
        name={stream.name}
      />
      <InfoCard
        hostIdentity={user.id}
        viewerIdentity={identity}
        name={stream.name}
        thumbnailUrl={stream.thumbnailUrl}
      />
      <AboutCard
        hostName={user.username}
        hostIdentity={user.id}
        viewerIdentity={identity}
        bio={user.bio}
        followedByCount={user._count.followedBy}
      />
    </>
  );
};
