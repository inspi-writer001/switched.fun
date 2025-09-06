/**
 * Tip notification configuration
 * These values control when and how tip notifications are displayed
 */

export const TIP_CONFIG = {
  // Threshold for large tips that show overlay on stream screen
  LARGE_TIP_THRESHOLD: 50, // $50 or more
  
  // Threshold for mega tips that get extra special treatment
  MEGA_TIP_THRESHOLD: 200, // $200 or more
  
  // Display durations (in milliseconds)
  OVERLAY_DISPLAY_DURATION: 3000, // 3 seconds
  OVERLAY_ANIMATION_DURATION: 500, // 0.5 seconds
  
  // Toast durations
  REGULAR_TOAST_DURATION: 5000, // 5 seconds
  LARGE_TOAST_DURATION: 8000, // 8 seconds
  MEGA_TOAST_DURATION: 10000, // 10 seconds
  
  // Queue management
  MAX_OVERLAY_QUEUE_SIZE: 3, // Maximum number of overlays to queue
  MAX_CHAT_NOTIFICATIONS: 5, // Maximum number of tips to show in chat
} as const;

export type TipConfig = typeof TIP_CONFIG;
