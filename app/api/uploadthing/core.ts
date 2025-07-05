import { createUploadthing, type FileRouter } from "uploadthing/next";

import { db } from "@/lib/db";
import { getSelfFromApi } from "@/lib/auth-service";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  thumbnailUploader: f({ 
    image: { 
      maxFileSize: "4MB", 
      maxFileCount: 1 
    } 
  })
    .middleware(async () => {
      const self = await getSelfFromApi();

      return { user: self }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.stream.update({
        where: {
          userId: metadata.user.id,
        },
        data: {
          thumbnailUrl: file.url,
        },
      });

      return { fileUrl: file.url };
    })
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;