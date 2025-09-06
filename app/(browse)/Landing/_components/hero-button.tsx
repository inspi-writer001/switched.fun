"use client";

import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export const HeroButton = () => {
    const isMobile = useMobile();
  return (
    <Link href="/explore">
      <Button size={isMobile ? "sm" : "lg"} className="flex items-center gap-2">
        Explore Streams <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  );
};
