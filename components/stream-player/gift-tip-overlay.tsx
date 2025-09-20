"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TipNotification } from "@/hooks/use-tip-broadcast";
import { TIP_CONFIG } from "@/lib/tip-config";
import { allGifts } from "./gift-items";
import { useGiftSound } from "@/hooks/use-gift-sound";

interface GiftTipOverlayProps {
  notification: TipNotification;
  onComplete: () => void;
}

// Confetti particle component with enhanced physics
const ConfettiParticle = ({ delay, color, size, index }: { delay: number; color: string; size: number; index: number }) => {
  const duration = 2 + Math.random() * 3; // 2-5 seconds
  const horizontalDrift = (Math.random() - 0.5) * 200; // -100px to +100px drift
  const rotationSpeed = 360 + Math.random() * 720; // 360-1080 degrees
  
  return (
    <div
      className={`absolute ${color} animate-confetti`}
      style={{
        width: `${size * 4}px`,
        height: `${size * 4}px`,
        left: `${Math.random() * 100}%`,
        top: `-20px`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        borderRadius: Math.random() > 0.5 ? '50%' : '0%', // Mix of circles and squares
        '--horizontal-drift': `${horizontalDrift}px`,
        '--rotation-speed': `${rotationSpeed}deg`,
      } as React.CSSProperties & { '--horizontal-drift': string; '--rotation-speed': string }}
    />
  );
};

export function GiftTipOverlay({ notification, onComplete }: GiftTipOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'display' | 'exit'>('enter');
  const { playGiftSound } = useGiftSound();

  // Find the gift details
  const gift = allGifts.find(g => g.id === notification.giftType || g.name === notification.giftName);
  
  useEffect(() => {
    try {
      // Validate notification data
      if (!notification || !notification.id || !notification.giftType) {
        console.error("Invalid gift notification in GiftTipOverlay:", notification);
        setIsVisible(false);
        return;
      }

      // Play gift sound
      const giftPrice = gift?.price || notification.amount;
      playGiftSound(giftPrice);

      // Enter animation
      const enterTimer = setTimeout(() => {
        setAnimationPhase('display');
      }, 300);

      // Display duration - longer for gift tips to appreciate the animation
      const displayTimer = setTimeout(() => {
        setAnimationPhase('exit');
      }, 4000);

      // Exit animation
      const exitTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 4500);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(displayTimer);
        clearTimeout(exitTimer);
      };
    } catch (error) {
      console.error("Error in GiftTipOverlay useEffect:", error);
      setIsVisible(false);
    }
  }, [onComplete, notification, gift?.price, playGiftSound]);

  if (!isVisible) return null;

  // Determine gift tier for styling
  const giftPrice = gift?.price || notification.amount;
  const isPremiumGift = gift?.premium || giftPrice >= 50;
  const isMegaGift = giftPrice >= 1000;
  
  const overlayClasses = isMegaGift 
    ? "bg-gradient-to-r from-yellow-500/40 to-red-500/40 border-yellow-400/80"
    : isPremiumGift
    ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/70"
    : "bg-gradient-to-r from-blue-500/20 to-green-500/20 border-blue-400/50";
    
  const glowClasses = isMegaGift
    ? "bg-gradient-to-r from-yellow-400/30 to-red-400/30"
    : isPremiumGift
    ? "bg-gradient-to-r from-purple-400/20 to-pink-400/20"
    : "bg-gradient-to-r from-blue-400/10 to-green-400/10";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      {/* Confetti Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(isMegaGift ? 30 : isPremiumGift ? 20 : 15)].map((_, i) => (
          <ConfettiParticle
            key={i}
            index={i}
            delay={i * 0.1}
            color={isMegaGift ? 'bg-yellow-400' : isPremiumGift ? 'bg-purple-400' : 'bg-blue-400'}
            size={Math.random() > 0.5 ? 2 : 3}
          />
        ))}
        {/* Additional colorful confetti */}
        {[...Array(isMegaGift ? 20 : 10)].map((_, i) => (
          <ConfettiParticle
            key={`color-${i}`}
            index={i}
            delay={i * 0.15}
            color={['bg-red-400', 'bg-green-400', 'bg-blue-400', 'bg-yellow-400', 'bg-pink-400'][i % 5]}
            size={2}
          />
        ))}
      </div>
      
      {/* Gift tip notification card */}
      <div 
        className={`
          relative ${overlayClasses} 
          border-2 rounded-3xl p-8 shadow-2xl max-w-md mx-4
          transform transition-all duration-700 ease-out
          ${animationPhase === 'enter' ? 'scale-50 opacity-0 rotate-12' : ''}
          ${animationPhase === 'display' ? 'scale-100 opacity-100 rotate-0' : ''}
          ${animationPhase === 'exit' ? 'scale-125 opacity-0 rotate-[-12deg] translate-y-[-3rem]' : ''}
        `}
      >
        {/* Animated background glow */}
        <div className={`absolute inset-0 ${glowClasses} rounded-3xl animate-pulse`} />
        
        {/* Content */}
        <div className="relative z-10 text-center space-y-4">
          {/* Gift Image - Large and prominent */}
          <div className="flex justify-center">
            <div className={`
              relative p-4 rounded-2xl shadow-lg transform transition-transform duration-1000
              ${animationPhase === 'display' ? 'animate-bounce' : ''}
              ${isMegaGift ? 'bg-gradient-to-br from-yellow-400 to-red-500' : 
                isPremiumGift ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 
                'bg-gradient-to-br from-blue-500 to-green-500'}
            `}>
              {gift ? (
                <div className="w-20 h-20 flex items-center justify-center">
                  {gift.icon}
                </div>
              ) : (
                <div className="w-20 h-20 flex items-center justify-center">
                  <Image
                    src={`/image/gifts/${notification.giftType}.png`}
                    alt={notification.giftName || 'Gift'}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Gift Name */}
          <div className="space-y-1">
            <h3 className={`text-2xl font-bold ${isMegaGift ? 'text-yellow-400' : isPremiumGift ? 'text-purple-400' : 'text-blue-400'}`}>
              {notification.giftName || gift?.name}
            </h3>
            <p className="text-lg text-white/90">
              Gift received!
            </p>
          </div>
          
          {/* Tipper info */}
          <div className="flex items-center justify-center gap-4 bg-black/20 rounded-2xl p-4">
            <Avatar className={`w-12 h-12 border-2 ${isMegaGift ? 'border-yellow-400/50' : isPremiumGift ? 'border-purple-400/50' : 'border-blue-400/50'}`}>
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
                sent you a gift!
              </p>
            </div>
          </div>
          
          {/* Amount */}
          <div className="bg-black/20 rounded-2xl p-4">
            <div className={`text-3xl font-bold ${isMegaGift ? 'text-yellow-400' : isPremiumGift ? 'text-purple-400' : 'text-green-400'} mb-1`}>
              ${notification.amount}
            </div>
            <div className="text-sm text-gray-300">
              {notification.tokenType}
            </div>
          </div>
        </div>
        
        {/* Floating sparkles around the card */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className={`absolute w-1 h-1 ${isMegaGift ? 'bg-yellow-400' : isPremiumGift ? 'bg-purple-400' : 'bg-blue-400'} rounded-full animate-ping`}
              style={{
                left: `${10 + i * 10}%`,
                top: `${20 + (i % 3) * 30}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s',
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Custom CSS for enhanced confetti animation */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-20px) translateX(0px) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(var(--horizontal-drift)) rotate(var(--rotation-speed));
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti ease-in infinite;
        }
      `}</style>
    </div>
  );
}

interface GiftTipOverlayManagerProps {
  notifications: TipNotification[];
  onNotificationComplete: (id: string) => void;
}

export function GiftTipOverlayManager({ notifications, onNotificationComplete }: GiftTipOverlayManagerProps) {
  const [currentOverlay, setCurrentOverlay] = useState<TipNotification | null>(null);
  const [queue, setQueue] = useState<TipNotification[]>([]);

  useEffect(() => {
    try {
      if (!notifications || notifications.length === 0) return;
      
      const latestNotification = notifications[0];
      
      // Validate notification data
      if (!latestNotification || !latestNotification.id || !latestNotification.giftType) {
        console.error("Invalid gift notification data:", latestNotification);
        return;
      }
      
      if (!currentOverlay) {
        // Show the latest notification immediately
        setCurrentOverlay(latestNotification);
      } else {
        // Add to queue if there's already an overlay showing
        setQueue(prev => {
          const exists = prev.some(n => n.id === latestNotification.id);
          return exists ? prev : [...prev, latestNotification].slice(0, 5); // Keep max 5 in queue
        });
      }
    } catch (error) {
      console.error("Error in GiftTipOverlayManager useEffect:", error);
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
    <GiftTipOverlay
      notification={currentOverlay}
      onComplete={handleOverlayComplete}
    />
  );
}
