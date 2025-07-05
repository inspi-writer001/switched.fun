import { redirect } from "next/navigation";

// import { getSelfByUsername } from "@/lib/auth-service";

import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";
import { Container } from "./_components/container";
import { Metadata } from "next";
import { getUserByUsernameFromApi } from "@/lib/user-service";

interface CreatorLayoutProps {
  params: { username: string };
  children: React.ReactNode;
}
// (A) generateMetadata runs on the server, ahead of time
export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await getUserByUsernameFromApi(params.username);

  if (!user) {
    return {
      title: "User Not Found | MyApp",
      robots: "noindex",
    };
  }

  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://switch-fun.vercel.app";
  const profileUrl = `${baseUrl}/u/${user.username}`;
  const ogImage = user.stream?.thumbnailUrl
    ? `${baseUrl}${user.stream.thumbnailUrl}`
    : user.imageUrl
    ? `${baseUrl}${user.imageUrl}`
    : `${baseUrl}/default-avatar.png`;

  const title = user.stream?.isLive
    ? `Watch ${user.username} live now!`
    : `${user.username}’s profile on MyApp`;
  const description = user.stream?.isLive
    ? "Join my livestream and get to interact with me live—let’s connect."
    : user.bio || `${user.username} is on MyApp.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: profileUrl,
      images: [
        {
          url: ogImage,
          alt: `${user.username}’s avatar or thumbnail`,
        },
      ],
      type: user.stream?.isLive ? "video.other" : "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

const CreatorLayout = async ({ params, children }: CreatorLayoutProps) => {
  // try {
  //   // const self = await getSelfByUsername(params.username);

  //   // if (!self) {
  //   //   redirect("/");
  //   // }

  // } catch (error) {
  //   console.error("Layout Error:", error);
  //   redirect("/");
  // }

  return (
    <>
      <Navbar />
      <div className="flex h-full pt-20">
        <Sidebar />
        <Container>{children}</Container>
      </div>
    </>
  );
};

export default CreatorLayout;
