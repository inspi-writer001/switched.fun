"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TipNotification } from "@/hooks/use-tip-broadcast";
import { TIP_CONFIG } from "@/lib/tip-config";
import { allGifts } from "./gift-items";

interface TipOverlayProps {
  notification: TipNotification;
  onComplete: () => void;
}

export function TipOverlay({ notification, onComplete }: TipOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'display' | 'exit'>('enter');

  useEffect(() => {
    try {
      // Validate notification data
      if (!notification || !notification.id || !notification.amount) {
        console.error("Invalid notification in TipOverlay:", notification);
        setIsVisible(false);
        return;
      }

      // Enter animation
      const enterTimer = setTimeout(() => {
        setAnimationPhase('display');
      }, TIP_CONFIG.OVERLAY_ANIMATION_DURATION);

      // Display duration
      const displayTimer = setTimeout(() => {
        setAnimationPhase('exit');
      }, TIP_CONFIG.OVERLAY_DISPLAY_DURATION);

      // Exit animation
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, TIP_CONFIG.OVERLAY_DISPLAY_DURATION + TIP_CONFIG.OVERLAY_ANIMATION_DURATION);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(displayTimer);
        clearTimeout(exitTimer);
      };
    } catch (error) {
      console.error("Error in TipOverlay useEffect:", error);
      setIsVisible(false);
    }
  }, [onComplete, notification]);

  if (!isVisible) return null;

  // Different styling based on tip size
  const isMegaTip = notification.isMegaTip;
  const isLargeTip = notification.isLargeTip;
  
  // Find gift details if this is a gift tip
  const gift = notification.giftType ? allGifts.find(g => g.id === notification.giftType || g.name === notification.giftName) : null;
  
  const overlayClasses = isMegaTip 
    ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/70"
    : "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50";
    
  const glowClasses = isMegaTip
    ? "bg-gradient-to-r from-purple-400/20 to-pink-400/20"
    : "bg-gradient-to-r from-yellow-400/10 to-orange-400/10";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Tip notification card */}
      <div 
        className={`
          relative ${overlayClasses} 
          border-2 rounded-2xl p-6 shadow-2xl
          transform transition-all duration-500 ease-out
          ${animationPhase === 'enter' ? 'scale-75 opacity-0 translate-y-8' : ''}
          ${animationPhase === 'display' ? 'scale-100 opacity-100 translate-y-0' : ''}
          ${animationPhase === 'exit' ? 'scale-110 opacity-0 translate-y-[-2rem]' : ''}
        `}
      >
        {/* Animated background glow */}
        <div className={`absolute inset-0 ${glowClasses} rounded-2xl animate-pulse`} />
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Gift icon or star icon */}
          <div className={`w-16 h-16 ${isMegaTip ? 'bg-purple-400' : 'bg-yellow-400'} rounded-full flex items-center justify-center shadow-lg`}>
            {gift ? (
              <div className="w-12 h-12 flex items-center justify-center">
                {gift.icon}
              </div>
            ) : (
              <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </div>
          
          {/* Tipper info */}
          <div className="flex items-center gap-3">
            <Avatar className={`w-12 h-12 border-2 ${isMegaTip ? 'border-purple-400/50' : 'border-yellow-400/50'}`}>
              <AvatarImage src={notification.tipperImageUrl} />
              <AvatarFallback className="text-lg font-bold">
                {notification.tipperUsername.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <p className="text-lg font-semibold text-white mb-1">
                {notification.tipperUsername}
              </p>
              <p className="text-sm text-gray-300">
                {gift ? `sent ${gift.name}!` : isMegaTip ? 'just sent a MEGA tip!' : 'just tipped'}
              </p>
            </div>
          </div>
          
          {/* Amount */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${isMegaTip ? 'text-purple-400' : 'text-green-400'} mb-1`}>
              ${notification.amount}
            </div>
            <div className="text-sm text-gray-300">
              {notification.tokenType}
            </div>
            {notification.giftType && (
              <div className="text-sm text-blue-400 mt-1">
                with {notification.giftName}
              </div>
            )}
          </div>
        </div>
        
        {/* Celebration particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(isMegaTip ? 10 : 6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 ${isMegaTip ? 'bg-purple-400' : 'bg-yellow-400'} rounded-full animate-bounce`}
              style={{
                left: `${20 + i * 8}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TipOverlayManagerProps {
  notifications: TipNotification[];
  onNotificationComplete: (id: string) => void;
}

export function TipOverlayManager({ notifications, onNotificationComplete }: TipOverlayManagerProps) {
  const [currentOverlay, setCurrentOverlay] = useState<TipNotification | null>(null);
  const [queue, setQueue] = useState<TipNotification[]>([]);

  useEffect(() => {
    try {
      if (!notifications || notifications.length === 0) return;
      
      const latestNotification = notifications[0];
      
      // Validate notification data
      if (!latestNotification || !latestNotification.id || !latestNotification.amount) {
        console.error("Invalid notification data:", latestNotification);
        return;
      }
      
      if (!currentOverlay) {
        // Show the latest notification immediately
        setCurrentOverlay(latestNotification);
      } else {
        // Add to queue if there's already an overlay showing
        setQueue(prev => {
          const exists = prev.some(n => n.id === latestNotification.id);
          return exists ? prev : [...prev, latestNotification].slice(0, TIP_CONFIG.MAX_OVERLAY_QUEUE_SIZE);
        });
      }
    } catch (error) {
      console.error("Error in TipOverlayManager useEffect:", error);
    }
  }, [notifications, currentOverlay]);

  const handleOverlayComplete = () => {
    try {
      if (queue.length > 0) {
        // Show next notification in queue
        const nextNotification = queue[0];
        setQueue(prev => prev.slice(1));
        setCurrentOverlay(nextNotification);
      } else {
        // No more notifications to show
        setCurrentOverlay(null);
      }
      
      if (currentOverlay) {
        onNotificationComplete(currentOverlay.id);
      }
    } catch (error) {
      console.error("Error in handleOverlayComplete:", error);
      // Reset state on error
      setCurrentOverlay(null);
      setQueue([]);
    }
  };

  if (!currentOverlay) return null;

  return (
    <TipOverlay
      notification={currentOverlay}
      onComplete={handleOverlayComplete}
    />
  );
}
