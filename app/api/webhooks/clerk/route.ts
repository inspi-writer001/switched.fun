import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'

import { db } from '@/lib/db'
import { resetIngresses } from '@/actions/ingress'

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
 
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    })
  }

  const eventType = evt.type;

  try {
    if (eventType === "user.created") {
      await db.user.create({
        data: {
          externalUserId: evt.data.id,
          username: evt.data.username || `user_${evt.data.id}`,
          imageUrl: evt.data.image_url || '',
          stream: {
            create: {
              name: `${evt.data.username || 'User'}'s stream`,
            },
          },
        },
      });
    }

    if (eventType === "user.updated") {
      const updateData: {
        username?: string
        imageUrl?: string
      } = {}

      if (evt.data.username) updateData.username = evt.data.username
      if (evt.data.image_url) updateData.imageUrl = evt.data.image_url

      await db.user.update({
        where: {
          externalUserId: evt.data.id,
        },
        data: updateData,
      });
    }

    if (eventType === "user.deleted") {
      if (!evt.data.id) {
        throw new Error('User ID is required for deletion')
      }

      await resetIngresses(evt.data.id);

      await db.user.delete({
        where: {
          externalUserId: evt.data.id,
        },
      });
    }

    return new Response('', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook event:', error)
    return new Response('Error processing webhook event', { status: 500 })
  }
};
