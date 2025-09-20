import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { TipNotification } from '@/hooks/use-tip-broadcast';

// Reaction interface
export interface ChatReaction {
  id: number;
  emoji: string;
  x: number;
  timestamp: number;
}

// Atoms for chat reactions (temporary state, no persistence needed)
export const reactionsAtom = atom<ChatReaction[]>([]);

// Base atom for tip notifications (in-memory)
const baseTipNotificationsAtom = atom<TipNotification[]>([]);

// Persistent atom that syncs with localStorage
export const tipNotificationsAtom = atom(
  (get) => get(baseTipNotificationsAtom),
  (get, set, newValue: TipNotification[]) => {
    // Update the base atom
    set(baseTipNotificationsAtom, newValue);
    
    // Persist to localStorage if available
    if (typeof window !== 'undefined') {
      try {
        // Clean up old notifications before saving (30 seconds for live streaming freshness)
        const thirtySecondsAgo = Date.now() - (30 * 1000);
        const filtered = newValue.filter(notification => 
          notification.timestamp > thirtySecondsAgo
        );
        // Sort by timestamp and keep only the 3 most recent notifications
        const sorted = filtered.sort((a: TipNotification, b: TipNotification) => b.timestamp - a.timestamp);
        const limited = sorted.slice(0, 3);
        localStorage.setItem('switch-fun-tip-notifications', JSON.stringify(limited));
      } catch (error) {
        console.error('Error saving tip notifications to localStorage:', error);
      }
    }
  }
);

// Initialize from localStorage on client side
export const initializeTipNotificationsAtom = atom(null, (get, set) => {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem('switch-fun-tip-notifications');
      if (item) {
        const parsed = JSON.parse(item);
        // Clean up old notifications (older than 30 seconds for live streaming freshness)
        const thirtySecondsAgo = Date.now() - (30 * 1000);
        const filtered = parsed.filter((notification: TipNotification) => 
          notification.timestamp > thirtySecondsAgo
        );
        // Sort by timestamp (newest first) and keep only the 3 most recent notifications
        const sorted = filtered.sort((a: TipNotification, b: TipNotification) => b.timestamp - a.timestamp);
        const limited = sorted.slice(0, 3);
        set(baseTipNotificationsAtom, limited);
      }
    } catch (error) {
      console.error('Error loading tip notifications from localStorage:', error);
    }
  }
});

// Derived atom for adding reactions
export const addReactionAtom = atom(
  null,
  (get, set, reaction: Omit<ChatReaction, 'id' | 'timestamp'>) => {
    const currentReactions = get(reactionsAtom);
    const newReaction: ChatReaction = {
      ...reaction,
      id: Date.now(),
      timestamp: Date.now()
    };
    
    set(reactionsAtom, [...currentReactions, newReaction]);
    
    // Auto-remove reaction after 3 seconds
    setTimeout(() => {
      set(reactionsAtom, (prev) => 
        prev.filter((r) => r.id !== newReaction.id)
      );
    }, 3000);
  }
);

// Derived atom for adding tip notifications
export const addTipNotificationAtom = atom(
  null,
  (get, set, notification: TipNotification) => {
    const currentNotifications = get(tipNotificationsAtom);
    // Add new notification and sort by timestamp (newest first)
    const allNotifications = [notification, ...currentNotifications];
    const sorted = allNotifications.sort((a: TipNotification, b: TipNotification) => b.timestamp - a.timestamp);
    // Keep only the 3 most recent notifications
    const updatedNotifications = sorted.slice(0, 3);
    set(tipNotificationsAtom, updatedNotifications);
  }
);

// Derived atom for clearing old reactions (cleanup)
export const clearOldReactionsAtom = atom(
  null,
  (get, set) => {
    const currentReactions = get(reactionsAtom);
    const fiveSecondsAgo = Date.now() - 5000;
    const filteredReactions = currentReactions.filter(
      reaction => reaction.timestamp > fiveSecondsAgo
    );
    set(reactionsAtom, filteredReactions);
  }
);

// Derived atom for clearing old tip notifications (cleanup)
export const clearOldTipNotificationsAtom = atom(
  null,
  (get, set) => {
    const currentNotifications = get(tipNotificationsAtom);
    const thirtySecondsAgo = Date.now() - (30 * 1000);
    const filteredNotifications = currentNotifications.filter(
      notification => notification.timestamp > thirtySecondsAgo
    );
    // Sort and limit to 3 most recent
    const sorted = filteredNotifications.sort((a: TipNotification, b: TipNotification) => b.timestamp - a.timestamp);
    const limited = sorted.slice(0, 3);
    
    if (limited.length !== currentNotifications.length) {
      set(tipNotificationsAtom, limited);
    }
  }
);

// Atom for chat input value (no persistence needed)
export const chatInputValueAtom = atom<string>('');

// Derived atom for large tip notifications (filtered from all tip notifications)
export const largeTipNotificationsAtom = atom<TipNotification[]>((get) => {
  const allNotifications = get(tipNotificationsAtom);
  return allNotifications.filter(notification => notification.isLargeTip || notification.isMegaTip);
});

// Derived atom for gift tip notifications (all tips with gifts, excluding large/mega tips)
export const giftTipNotificationsAtom = atom<TipNotification[]>((get) => {
  const allNotifications = get(tipNotificationsAtom);
  return allNotifications.filter(notification => 
    notification.giftType && 
    notification.giftName && 
    !notification.isLargeTip && 
    !notification.isMegaTip
  );
});

// Derived atom for removing completed tip notifications
export const removeTipNotificationAtom = atom(
  null,
  (get, set, notificationId: string) => {
    const currentNotifications = get(tipNotificationsAtom);
    const filteredNotifications = currentNotifications.filter(
      notification => notification.id !== notificationId
    );
    set(tipNotificationsAtom, filteredNotifications);
  }
);
