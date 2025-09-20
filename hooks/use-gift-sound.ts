"use client";

import { useCallback, useRef } from 'react';

// Simple sound effect hook for gift tips
export function useGiftSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playGiftSound = useCallback((giftPrice: number) => {
    // Only play sounds if user has interacted with the page (browser requirement)
    if (typeof window === 'undefined') return;

    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create different tones based on gift price
      const frequency = giftPrice >= 1000 ? 800 : giftPrice >= 100 ? 600 : 400; // Higher pitch for more expensive gifts
      const duration = giftPrice >= 1000 ? 0.8 : giftPrice >= 100 ? 0.6 : 0.4; // Longer duration for expensive gifts

      // Create oscillator for the main tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure the sound
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, audioContext.currentTime + duration / 2);
      oscillator.frequency.exponentialRampToValueAtTime(frequency, audioContext.currentTime + duration);

      // Configure volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);

      // Add a second harmonic for richer sound on premium gifts
      if (giftPrice >= 100) {
        const harmonic = audioContext.createOscillator();
        const harmonicGain = audioContext.createGain();

        harmonic.connect(harmonicGain);
        harmonicGain.connect(audioContext.destination);

        harmonic.frequency.setValueAtTime(frequency * 2, audioContext.currentTime);
        harmonicGain.gain.setValueAtTime(0, audioContext.currentTime);
        harmonicGain.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
        harmonicGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        harmonic.start(audioContext.currentTime + 0.1);
        harmonic.stop(audioContext.currentTime + duration);
      }

    } catch (error) {
      console.log('Sound playback not available:', error);
      // Silently fail - sound is optional
    }
  }, []);

  return { playGiftSound };
}
