"use client";

import { TipNotification } from "@/hooks/use-tip-broadcast";

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return "yesterday";
}

interface TipNotificationItemProps {
  notification: TipNotification;
}

export function TipNotificationItem({ notification }: TipNotificationItemProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5">
      {/* Yellow star icon */}
      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
      
      {/* Text content */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-purple-400">
          {notification.tipperUsername}
        </span>
        <span className="text-white">tipped</span>
        <span className="font-bold text-green-400">
          ${notification.amount}
        </span>
        {notification.giftType && (
          <span className="text-sm text-blue-400">
            with {notification.giftName}
          </span>
        )}
      </div>
    </div>
  );
}

interface TipNotificationsProps {
  notifications: TipNotification[];
  maxItems?: number;
}

export function TipNotifications({ notifications, maxItems = 3 }: TipNotificationsProps) {
  const recentNotifications = notifications.slice(0, maxItems);

  if (recentNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {recentNotifications.map((notification) => (
        <TipNotificationItem
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
}
