"use client";

import { useUser } from "@civic/auth-web3/react";
import { useParams, usePathname } from "next/navigation";
import { Fullscreen, KeyRound, MessageSquare, Users } from "lucide-react";
import { NavItem, NavItemSkeleton } from "./nav-item";

export const Navigation = () => {
  const pathname = usePathname();
  const { username } = useParams<{ username: string }>();
  const { user, isLoading } = useUser();

  const routes = [
    {
      label: "Stream",
      href: `/u/${username}`,
      icon: Fullscreen,
    },
    {
      label: "Keys",
      href: `/u/${username}/keys`,
      icon: KeyRound,
    },
    {
      label: "Chat",
      href: `/u/${username}/chat`,
      icon: MessageSquare,
    },
    {
      label: "Community",
      href: `/u/${username}/community`,
      icon: Users,
    },
  ];

  if (isLoading) {
    return (
      <ul className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <NavItemSkeleton key={i} />
        ))}
      </ul>
    );
  }

  // ⛔ Avoid rendering if user is still undefined
  if (!user?.id) return null; 

  return (
    <ul className="space-y-2 px-2 pt-4 lg:pt-0">
      {routes.map((route) => (
        <NavItem
          key={route.href}
          label={route.label}
          icon={route.icon}
          href={route.href}
          isActive={pathname === route.href}
        />
      ))}
    </ul>
  );
};
