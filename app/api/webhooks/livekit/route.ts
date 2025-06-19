import { headers } from "next/headers";
import { WebhookReceiver } from "livekit-server-sdk";

import { db } from "@/lib/db";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headerPayload = headers();
    const authorization = headerPayload.get("Authorization");

    if (!authorization) {
      console.error("LiveKit webhook: No authorization header");
      return new Response("No authorization header", { status: 400 });
    }

    const event = receiver.receive(body, authorization);
    console.log("LiveKit webhook event:", event.event);

    if (event.event === "ingress_started") {
      await db.stream.update({
        where: {
          ingressId: event.ingressInfo?.ingressId,
        },
        data: {
          isLive: true,
        },
      });
      console.log("Stream set to live:", event.ingressInfo?.ingressId);
    }

    if (event.event === "ingress_ended") {
      await db.stream.update({
        where: {
          ingressId: event.ingressInfo?.ingressId,
        },
        data: {
          isLive: false,
        },
      });
      console.log("Stream set to offline:", event.ingressInfo?.ingressId);
    }

    // Always return success response for LiveKit
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("LiveKit webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}