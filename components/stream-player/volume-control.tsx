"use client";

import { Volume1, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef } from "react"; // Added useEffect and useRef

import { Hint } from "@/components/hint";
import { Slider } from "@/components/ui/slider";

interface VolumeControlProps {
  onToggle: () => void;
  onChange: (value: number) => void;
  value: number;
}

export const VolumeControl = ({
  onToggle,
  onChange,
  value,
}: VolumeControlProps) => {
  const initialRender = useRef(true); // Track initial render

  useEffect(() => {
    if (initialRender.current && value === 0) {
      onChange(50); // Set default volume to 50% on first render
    }
    initialRender.current = false;
  }, [value, onChange]);

  const isMuted = value === 0;
  const isAboveHalf = value > 50;

  let Icon = Volume1;
  if (isMuted) {
    Icon = VolumeX;
  } else if (isAboveHalf) {
    Icon = Volume2;
  }

  const label = isMuted ? "Unmute" : "Mute";

  const handleChange = (value: number[]) => {
    onChange(value[0]);
  };

  return (
    <div className="flex items-center gap-2">
      <Hint label={label} asChild>
        <button
          onClick={onToggle}
          className="text-white hover:bg-white/10 p-1.5 rounded-lg"
        >
          <Icon className="h-6 w-6" />
        </button>
      </Hint>
      <Slider
        className="w-[8rem] cursor-pointer"
        onValueChange={handleChange}
        value={[value]}
        max={100}
        step={1}
      />
    </div>
  );
};
