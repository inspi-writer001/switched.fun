"use client";

import { TipNotification } from "@/hooks/use-tip-broadcast";

interface TipNotificationItemProps {
  notification: TipNotification;
}

export function TipNotificationItem({ notification }: TipNotificationItemProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5">
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
