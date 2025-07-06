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

    // Handle ingress events (OBS, RTMP, WHIP streams)
    if (event.event === "ingress_started") {
      await db.stream.update({
        where: {
          ingressId: event.ingressInfo?.ingressId,
        },
        data: {
          isLive: true,
        },
      });
      console.log("Ingress stream set to live:", event.ingressInfo?.ingressId);
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
      console.log("Ingress stream set to offline:", event.ingressInfo?.ingressId);
    }

    // Handle participant events (browser streams)
    if (event.event === "participant_joined") {
      const participant = event.participant;
      if (participant && participant.identity.startsWith("host-")) {
        // Extract user ID from host identity (host-{userId})
        const userId = participant.identity.replace("host-", "");
        
        await db.stream.update({
          where: {
            userId: userId,
            streamType: "BROWSER",
          },
          data: {
            isLive: true,
          },
        });
        console.log("Browser stream set to live for user:", userId);
      }
    }

    if (event.event === "participant_left") {
      const participant = event.participant;
      if (participant && participant.identity.startsWith("host-")) {
        // Extract user ID from host identity (host-{userId})
        const userId = participant.identity.replace("host-", "");
        
        await db.stream.update({
          where: {
            userId: userId,
            streamType: "BROWSER",
          },
          data: {
            isLive: false,
          },
        });
        console.log("Browser stream set to offline for user:", userId);
      }
    }

    // Always return success response for LiveKit
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("LiveKit webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}