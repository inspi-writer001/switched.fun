"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ImageCarousel from "./_components/ImageCarousel";
import Link from "next/link";
import { usePathname } from "next/navigation";

const VideoHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);

  const pathname = usePathname();

  if(pathname !== "/") return null;

  const carouselImages = [
    {
      url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2671&q=80",
      alt: "Person playing Call of Duty",
      caption: "Live Gaming Streams",
    },
    {
      url: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
      alt: "Person coding",
      caption: "Live Coding Sessions",
    },
    {
      url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
      alt: "Live event with audience",
      caption: "Live Events",
    },
    {
      url: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1764&q=80",
      alt: "Content creator with equipment",
      caption: "Content Creation",
    },
  ];

  useEffect(() => {
    if (videoRef.current) {
      // Set up event listeners for the video
      const video = videoRef.current;

      const onMetadataLoaded = () => {
        console.log("Video metadata loaded");
        setIsVideoLoaded(true);
      };

      const onCanPlayThrough = () => {
        console.log("Video can play through");
        setIsVideoLoaded(true);
      };

      const onError = (e: Event) => {
        console.error("Video error:", e);
        setLoadError(true);
        setShowCarousel(true); // Show carousel if video fails
      };

      // Add event listeners
      video.addEventListener("loadedmetadata", onMetadataLoaded);
      video.addEventListener("canplaythrough", onCanPlayThrough);
      video.addEventListener("error", onError);

      // Try playing the video as soon as the component mounts
      const playVideo = async () => {
        try {
          // Explicitly set the src attribute in case the source tag isn't working
          if (!video.src) {
            video.src =
              "https://cdn.gpteng.co/df8c4dcf-c6de-48fe-adf6-26cec00a3a8f/Gaming_Coding_Streaming.mp4";
          }

          await video.play();
          console.log("Video playing successfully");
        } catch (err) {
          console.log("Auto-play was prevented or video error:", err);
          // Show carousel instead if video fails
          setShowCarousel(true);
        }
      };

      // Small delay to ensure the video element is fully attached to the DOM
      setTimeout(playVideo, 100);

      // Cleanup function
      return () => {
        video.removeEventListener("loadedmetadata", onMetadataLoaded);
        video.removeEventListener("canplaythrough", onCanPlayThrough);
        video.removeEventListener("error", onError);
      };
    } else {
      // If video element is not available, show carousel
      setShowCarousel(true);
    }
  }, []);

  return (
    <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden rounded-xl">
      {/* Show carousel if video fails or has error */}
      {showCarousel && (
        <ImageCarousel
          images={carouselImages}
          autoPlay={true}
          interval={2000}
          showControls={false}
        />
      )}

      {/* Video element with inline source (will be hidden if carousel is shown) */}
      {!showCarousel && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          src="https://res.cloudinary.com/detr9iyys/video/upload/v1746621719/n9uzeedormtzopsksiwm.mp4"
        />
      )}

      {/* Display a loading indicator if the video isn't loaded yet */}
      {!isVideoLoaded && !loadError && !showCarousel && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="animate-pulse flex flex-col items-center">
            <Skeleton className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent" />
            <p className="mt-4 text-white/80">Loading video...</p>
          </div>
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>

      {/* Content positioned over the video */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display gradient-text mb-4">
            Livestream And Get Fan Rewards
          </h1>
          <p className="text-xl text-white/80 mb-6">
            Gaming, coding, live events, and creative content — all powered by
            Solana blockchain.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Start Watching
            </Button>
            <Link href="/explore">
              <Button
                size="lg"
                variant="outline"
                className="flex items-center gap-2"
              >
                Explore Streams <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoHero;
