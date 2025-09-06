"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatInfo } from "./chat-info";
import Picker, { EmojiClickData } from "emoji-picker-react";
import { Smile } from "lucide-react";

// Define the list of emojis for quick reactions
const EMOJIS = ["❤️", "😂", "😮", "😢", "👍", "👎"];

interface ChatFormProps {
  onSubmit: () => void;
  onReact: (emoji: string) => void;
  value: string;
  onChange: (value: string) => void;
  isHidden: boolean;
  isFollowersOnly: boolean;
  isFollowing: boolean;
  isDelayed: boolean;
  isHost?: boolean;
}

export const ChatForm = ({
  onSubmit,
  onReact,
  value,
  onChange,
  isHidden,
  isFollowersOnly,
  isFollowing,
  isDelayed,
  isHost = false,
}: ChatFormProps) => {
  const [isDelayBlocked, setIsDelayBlocked] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiButtonRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hosts can always chat regardless of restrictions
  const isFollowersOnlyAndNotFollowing = isFollowersOnly && !isFollowing && !isHost;
  const isDisabled = isHidden || (isDelayBlocked && !isHost) || isFollowersOnlyAndNotFollowing;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!value || isDisabled) return;

    if (isDelayed && !isDelayBlocked && !isHost) {
      setIsDelayBlocked(true);
      setTimeout(() => {
        setIsDelayBlocked(false);
        onSubmit();
      }, 3000);
    } else {
      onSubmit();
    }
  };

  // Close bubbling emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showPicker &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  if (isHidden) {
    return null;
  }

  // Insert emoji at cursor position and focus input
  const onEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    const newValue =
      value.substring(0, start) + emojiData.emoji + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      input.focus();
      const newPos = start + emojiData.emoji.length;
      input.setSelectionRange(newPos, newPos);
    }, 0);

    setShowEmoji(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-row items-center p-3"
    >
      <div className="w-full flex items-center">
        <ChatInfo isDelayed={isDelayed} isFollowersOnly={isFollowersOnly} isHost={isHost} />
        <div className="">
          {/* Input + chat-input emoji picker button */}
          <div className="flex w-full gap-3">
            <Input
              ref={inputRef}
              onChange={(e) => onChange(e.target.value)}
              value={value}
              disabled={isDisabled}
              placeholder="Send a message"
              className={cn(
                "w-full text-sm border-white/10",
                (isFollowersOnly || isDelayed) && "rounded-t-none border-t-0"
              )}
            />
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className="p-2 hover:bg-white/10 rounded-full left-2"
              aria-label="Show emoji picker"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Chat-input emoji picker popover */}
        {showEmoji && (
          <div className="absolute bottom-full right-0 mb-2 z-10 shadow-[0_2px_8px_rgba(0,0,0,0.15)] rounded-lg bg-white overflow-hidden">
            <Picker onEmojiClick={onEmojiClick} />
          </div>
        )}
      </div>
      {/* Bubble-reaction emoji and picker on hover */}
      <div
        ref={emojiButtonRef}
        className="absolute right-[66px] items-center p-0"
        onMouseEnter={() => setShowPicker(true)}
        onMouseLeave={() => setShowPicker(false)}
      >
        <Button
          type="button"
          className="hover:bg-accent hover:text-accent-foreground w-5 h-5 rounded-full p-3 m-2.5"
        >
          ❤️
        </Button>
        {showPicker && (
          <div className="absolute bottom-10 flex flex-col space-y-1 p-1 rounded-xl shadow-lg items-center">
            {EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                type="button"
                size="icon"
                variant="primary"
                onClick={() => onReact(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-x-2">
        <Button type="submit" variant="primary" size="sm" disabled={isDisabled}>
          Chat
        </Button>
      </div>
    </form>
  );
};
