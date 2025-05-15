📺 Switched.fun — Livestreaming Meets Web3
Switched.fun is a decentralized livestreaming platform that empowers creators to monetize their content through USDT tips and NFT rewards, all built on the Solana blockchain.

demo video of civic auth implementation : https://www.loom.com/share/afa48d7063a14fc3b6ce8b74f4285650?sid=5aedf1a7-028a-42d9-9583-451b113461f6

x post : https://x.com/TechWithGwin/status/1921309955279200645?t=etCpoA-8Yv5ElMwFlCX4qA&s=19

✨ Key Features
🔐 Civic Auth Integration — Seamless wallet-based authentication with privacy-preserving identity verification.

🎥 Low-latency Livestreaming — Fast, reliable streaming experience tailored for creators and audiences.

💸 Crypto Tipping — Viewers can support creators with USDT directly in-stream.

🖼️ NFT Drops — Enable unique collectibles and community rewards during livestreams.

🌐 Built on Solana — Scalable, cost-efficient, and secure blockchain infrastructure.

other Features:

- 📡 Streaming using RTMP / WHIP protocols
- 🌐 Generating ingress
- 🔗 Connecting Next.js app to OBS / Your favorite streaming software
- 🔐 Authentication using civic auth
- 📸 Thumbnail upload
- 👀 Live viewer count
- 🚦 Live statuses
- 💬 Real-time chat using sockets
- 🎨 Unique color for each viewer in chat
- 👥 Following system
- 🚫 Blocking system
- 👢 Kicking participants from a stream in real-time
- 🎛️ Streamer / Creator Dashboard
- 🐢 Slow chat mode
- 🔒 Followers only chat mode
- 📴 Enable / Disable chat
- 🔽 Collapsible layout (hide sidebars, chat etc, theatre mode etc.)
- 📚 Sidebar following & recommendations tab
- 🏠 Home page recommending streams, sorted by live first
- 🔍 Search results page with a different layout
- 🔄 Syncing user information to our DB using Webhooks
- 📡 Syncing live status information to our DB using Webhooks
- 🤝 Community tab
- 🎨 Beautiful design
- ⚡ Blazing fast application
- 📄 SSR (Server-Side Rendering)
- 🗺️ Grouped routes & layouts
- 🗃️ MySQL
- 🚀 Deployment

### Prerequisites

**Node version 18.17 or later**

### Install packages

```shell
npm i
```

### Setup .env file

```js
NEXT_PUBLIC_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_AFTER_SIGN_UP_URL=/


DATABASE_URL=

LIVEKIT_API_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_WS_URL=

UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

<!-- civic auth -->

NEXT_PUBLIC_CIVIC_CLIENT_ID=

# Set to "true" to use Mainnet‑Beta; otherwise we'll default to Devnet

NEXT_PUBLIC_USE_MAINNET=FALSE

### Setup Prisma

Add MySQL Database (I used PlanetScale)

```shell
npx prisma generate
npx prisma db push

```

### Start the app

```shell
npm run dev
```

## Available commands

Running commands with npm `npm run [command]`

| command | description                              |
| :------ | :--------------------------------------- |
| `dev`   | Starts a development instance of the app |
