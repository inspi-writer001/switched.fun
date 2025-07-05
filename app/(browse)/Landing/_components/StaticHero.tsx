import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function StaticHero() {
  return (
    <>
      {/* Content positioned over the video */}
      <div className="absolute bg-gradient-to-t from-black via-black/80 to-transparent inset-0 flex flex-col justify-end p-8 z-10">
        <div className="max-w-2xl">
          <div className="text-4xl md:text-5xl lg:text-6xl text-white mb-4 font-bold">
            Livestream And Get Fan Rewards
          </div>
          <p className="text-xl text-white/80 mb-6">
            Gaming, coding, live events, and creative content — all powered by
            Solana blockchain.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/explore">
              <Button
                size="lg"
                className="flex items-center gap-2"
              >
                Explore Streams <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 