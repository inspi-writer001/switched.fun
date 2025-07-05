"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface Image {
  url: string;
  alt: string;
  caption: string;
}

interface OptimizedImageCarouselProps {
  images: Image[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  showControls?: boolean;
}

export function OptimizedImageCarousel({
  images,
  autoPlay = true,
  interval = 5000,
  className = "",
  showControls = true,
}: OptimizedImageCarouselProps) {
  const [api, setApi] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Set up autoplay with the specified interval
  useEffect(() => {
    if (!autoPlay || !api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, interval);

    return () => clearInterval(intervalId);
  }, [autoPlay, interval, api]);

  // Update current index when carousel changes
  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrentIndex(selectedIndex);
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <Carousel
      className={`w-full ${className}`}
      opts={{
        align: "start",
        loop: true,
      }}
      setApi={setApi}
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index} className="h-[500px] relative">
            <div className="h-full w-full relative overflow-hidden rounded-xl">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === 0} // Only prioritize first image
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                quality={85}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-2xl font-bold text-white">
                  {image.caption}
                </h3>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {showControls && (
        <>
          <CarouselPrevious className="left-4 bg-black/50 hover:bg-black/75 border-none text-white" />
          <CarouselNext className="right-4 bg-black/50 hover:bg-black/75 border-none text-white" />
        </>
      )}
    </Carousel>
  );
} 