"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Play,
  Podcast,
  Radio,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoLiveWithOBS } from "./go-live-with-obs";
import { GoLiveWithBrowser } from "./go-live-with-browser";
import { ScheduleStream } from "./schedule-stream";

interface GoLiveProps {
  user: {
    id: string;
    username?: string;
  } | null;
  size?: "default" | "sm" | "lg" | "icon";
}

type ModalType = "browser" | "obs" | "schedule" | null;

// Static content outside component to prevent recreation
const MENU_ITEMS = [
  {
    id: "browser" as const,
    icon: Radio,
    label: "Go Live With Browser",
    modal: "browser" as const,
  },
  {
    id: "obs" as const,
    icon: Podcast,
    label: "Go Live With OBS",
    modal: "obs" as const,
  },
  {
    id: "schedule" as const,
    icon: CalendarClock,
    label: "Schedule Stream for Later",
    modal: "schedule" as const,
  },
] as const;

function GoLive({ user, size = "default" }: GoLiveProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get modal from URL query param
  const urlModal = searchParams.get("modal") as ModalType;
  const [localModal, setLocalModal] = useState<ModalType>(null);

  // Use URL modal if valid, otherwise use local state
  const activeModal =
    urlModal && MENU_ITEMS.some((item) => item.modal === urlModal)
      ? urlModal
      : localModal;

  // Update URL when modal changes
  const updateModalInURL = useCallback(
    (modal: ModalType) => {
      const params = new URLSearchParams(searchParams.toString());

      if (modal) {
        params.set("modal", modal);
      } else {
        params.delete("modal");
      }

      // Use replace to avoid adding to browser history for modal changes
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Handle modal state changes
  const handleOpenModal = useCallback(
    (modalType: ModalType) => {
      setLocalModal(modalType);
      updateModalInURL(modalType);
      setIsDropdownOpen(false);
    },
    [updateModalInURL]
  );

  const handleCloseModal = useCallback(() => {
    setLocalModal(null);
    updateModalInURL(null);
  }, [updateModalInURL]);

  // Sync URL changes to local state
  useEffect(() => {
    if (urlModal && MENU_ITEMS.some((item) => item.modal === urlModal)) {
      setLocalModal(urlModal);
    } else if (!urlModal) {
      setLocalModal(null);
    }
  }, [urlModal]);

  // Security check: Only show for authenticated users
  if (!user?.id) {
    return null;
  }

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <>
            <Button
              size={size}
              aria-label="Go live options"
              aria-expanded={isDropdownOpen}
              className="hidden md:block"
            >
              Go Live
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>

            <Button
              size={size}
              aria-label="Go live options"
              aria-expanded={isDropdownOpen}
              className="md:hidden"
            >
              <Play className="w-4 h-4" />
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-72 bg-background"
          align="end"
          sideOffset={8}
        >
          {MENU_ITEMS.map((item, index) => {
            const IconComponent = item.icon;

            return (
              <React.Fragment key={item.id}>
                <DropdownMenuItem
                  className="cursor-pointer flex justify-between p-3 bg-transparent hover:bg-accent"
                  onClick={() => handleOpenModal(item.modal)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenModal(item.modal);
                    }
                  }}
                >
                  <div className="flex items-center gap-x-2">
                    <IconComponent className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm text-foreground capitalize">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </DropdownMenuItem>

                {/* Add separator before schedule item */}
                {index === 1 && <DropdownMenuSeparator className="bg-border" />}
              </React.Fragment>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal Components - Only render active modal for performance */}
      {activeModal === "browser" && (
        <GoLiveWithBrowser
          user={user}
          open={true}
          onOpenChange={handleCloseModal}
        />
      )}

      {activeModal === "obs" && (
        <GoLiveWithOBS
          user={user}
          open={true}
          onOpenChange={handleCloseModal}
        />
      )}

      {activeModal === "schedule" && (
        <ScheduleStream
          user={user}
          open={true}
          onOpenChange={handleCloseModal}
        />
      )}
    </>
  );
}

// Memoize component to prevent unnecessary re-renders
export default React.memo(GoLive);

// Export skeleton for loading states
export const GoLiveSkeleton = () => (
  <Button disabled size="default">
    <div className="w-16 h-4 bg-muted animate-pulse rounded" />
    <ChevronDown className="w-4 h-4 ml-2" />
  </Button>
);
