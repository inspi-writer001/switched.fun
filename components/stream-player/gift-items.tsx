import React from "react";

import Image from "next/image";

export interface Gift {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  color: string;
  premium?: boolean;
}

export const allGifts: Gift[] = [
  {
    id: "support",
    name: "support",
    price: 1,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/support.png"}
        alt="support"
      />
    ),
    color: "bg-gray-600",
  },
  {
    id: "siptip",
    name: "SipTip",
    price: 2,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/sip_tip.png"}
        alt="sip_tip"
      />
    ),
    color: "bg-gray-600",
  },
  {
    id: "botsupport",
    name: "BotSupport",
    price: 5,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/bot_support.png"}
        alt="bot_support"
      />
    ),
    color: "bg-blue-500",
  },
  {
    id: "friendlyai",
    name: "FriendlyAI",
    price: 7,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/friendly_ai.png"}
        alt="friendly_ai"
      />
    ),
    color: "bg-blue-500",
  },
  {
    id: "audiomoney",
    name: "AudioMoney",
    price: 10,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/audio_money.png"}
        alt="audio_money"
      />
    ),
    color: "bg-blue-500",
  },
  {
    id: "modbot",
    name: "ModBot",
    price: 15,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/mod_bot.png"}
        alt="mod_bot"
      />
    ),
    color: "bg-blue-500",
  },
  {
    id: "vibes",
    name: "Vibes",
    price: 20,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/vibes.png"}
        alt="vibes"
      />
    ),
    color: "bg-purple-500",
  },
  {
    id: "buzz",
    name: "Buzz",
    price: 50,
    icon: (
      <Image width={10} height={10} src={"/image/gifts/buzz.png"} alt="buzz" />
    ),
    color: "bg-purple-500",
    premium: true,
  },
  {
    id: "eos",
    name: "EOS mini",
    price: 75,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/eos_mini.png"}
        alt="eos_mini"
      />
    ),
    color: "bg-purple-500",
    premium: true,
  },
  {
    id: "alphas",
    name: "Alphas",
    price: 100,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/alphas.png"}
        alt="alphas"
      />
    ),
    color: "bg-purple-500",
    premium: true,
  },
  {
    id: "lootbox",
    name: "LootBox",
    price: 150,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/loot_box.png"}
        alt="loot_box"
      />
    ),
    color: "bg-purple-500",
    premium: true,
  },
  {
    id: "makeover",
    name: "Makeover",
    price: 150,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/makeover.png"}
        alt="makeover"
      />
    ),
    color: "bg-purple-500",
    premium: true,
  },
  {
    id: "nfchips",
    name: "NFChips",
    price: 200,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/nfchips.png"}
        alt="nfchips"
      />
    ),
    color: "bg-gradient-to-br from-purple-600 to-pink-600",
    premium: true,
  },
  {
    id: "kash",
    name: "Kash",
    price: 500,
    icon: (
      <Image width={10} height={10} src={"/image/gifts/kash.png"} alt="kash" />
    ),
    color: "bg-gradient-to-br from-purple-600 to-pink-600",
    premium: true,
  },
  {
    id: "bloom",
    name: "Bloom",
    price: 750,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/bloom.png"}
        alt="bloom"
      />
    ),
    color: "bg-gradient-to-br from-purple-600 to-pink-600",
    premium: true,
  },
  {
    id: "habiti",
    name: "Habiti",
    price: 1000,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/habibti.png"}
        alt="habibti"
      />
    ),
    color: "bg-gradient-to-br from-purple-600 to-pink-600",
    premium: true,
  },
  {
    id: "loveraid",
    name: "LoveRaid",
    price: 2000,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/love_raid.png"}
        alt="loveraid"
      />
    ),
    color: "bg-gradient-to-br from-yellow-400 to-red-500",
    premium: true,
  },
  {
    id: "flexbag",
    name: "FlexBag",
    price: 2500,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/flex_bag.png"}
        alt="flex_bag"
      />
    ),
    color: "bg-gradient-to-br from-yellow-400 to-red-500",
    premium: true,
  },
  {
    id: "whalepack",
    name: "WhalePack",
    price: 5000,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/whale_pack.png"}
        alt="whale_pack"
      />
    ),
    color: "bg-gradient-to-br from-yellow-400 to-red-500",
    premium: true,
  },
  {
    id: "starpower",
    name: "StarPower",
    price: 10000,
    icon: (
      <Image
        width={60}
        height={60}
        src={"/image/gifts/star_power.png"}
        alt="star_power"
      />
    ),
    color: "bg-gradient-to-br from-yellow-400 to-red-500",
    premium: true,
  },
];
