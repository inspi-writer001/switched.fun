import { WifiOff } from "lucide-react";
import Image from "next/image";

interface OfflineVideoProps {
  username: string;
  thumbnailUrl?: string | null;
}

export const OfflineVideo = ({ username, thumbnailUrl }: OfflineVideoProps) => {
  return (
    <>
      {thumbnailUrl ? (
        <div className="h-full flex flex-col space-y-4 justify-center items-center relative">
          <div className="absolute inset-0">
            <Image
              src={thumbnailUrl}
              alt={username}
              fill
              className="object-cover"
            />
          </div>

          <span className="absolute top-2 left-4 inline-flex items-center gap-2 bg-white rounded-full px-2 py-1">
            <WifiOff className="h-4 w-4 text-black" />
            <p className="text-gray-700 capitalize">offline</p>
          </span>
        </div>
      ) : (
        <div className="h-full flex flex-col space-y-4 justify-center items-center">
          <WifiOff className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">{username} is offline</p>
        </div>
      )}
    </>
  );
};
