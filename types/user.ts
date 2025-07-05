export interface User {
  id: string;
  externalUserId: string;
  username: string;
  imageUrl: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  stream?: {
    id: string;
    name: string;
    thumbnailUrl?: string;
    isLive: boolean;
    isChatEnabled: boolean;
    isChatFollowersOnly: boolean;
    isChatDelayed: boolean;
    serverUrl?: string;
    streamKey?: string;
  };
  interests?: {
    subCategory: {
      id: string;
      name: string;
    };
  }[];
  _count?: {
    followedBy: number;
  };
} 