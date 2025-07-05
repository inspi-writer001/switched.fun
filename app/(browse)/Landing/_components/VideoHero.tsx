"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { OptimizedImageCarousel } from "./OptimizedImageCarousel";
import { GoLiveButton } from "./GoLiveButton";
const VIDEO_URL = "https://res.cloudinary.com/detr9iyys/video/upload/v1749460898/bujanu6mz2ywqmyrxbtm.mp4";

const CAROUSEL_IMAGES = [
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

export function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoState, setVideoState] = useState<'loading' | 'playing' | 'error'>('loading');
  const [showGoLive, setShowGoLive] = useState(false);

  const handleVideoError = useCallback(() => {
    setVideoState('error');
  }, []);

  const handleVideoLoad = useCallback(() => {
    setVideoState('playing');
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => handleVideoLoad();
    const handleError = () => handleVideoError();

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Try to play video
    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        handleVideoError();
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(playVideo, 100);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      clearTimeout(timeoutId);
    };
  }, [handleVideoLoad, handleVideoError]);

  // Show GoLive button after a short delay to avoid layout shift
  useEffect(() => {
    const timer = setTimeout(() => setShowGoLive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Video with optimized loading */}
      {videoState !== 'error' && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          src={VIDEO_URL}
        />
      )}

      {/* Fallback carousel */}
      {videoState === 'error' && (
        <OptimizedImageCarousel
          images={CAROUSEL_IMAGES}
          autoPlay={true}
          interval={3000}
          showControls={false}
        />
      )}

      {/* Loading skeleton */}
      {videoState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="animate-pulse flex flex-col items-center">
            <Skeleton className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent" />
            <p className="mt-4 text-white/80">Loading video...</p>
          </div>
        </div>
      )}

      {/* GoLive button positioned over content */}
      {/* {showGoLive && (
        <div className="absolute top-4 right-4 z-20">
          <GoLiveButton />
        </div>
      )} */}
    </>
  );
} 