"use client";

import { Settings } from "lucide-react";

import { Hint } from "@/components/hint";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QualityControlProps {
  onQualityChange: (quality: string) => void;
  currentQuality: string;
}

const qualityOptions = [
  { value: "auto", label: "Auto" },
  { value: "1080p", label: "1080p" },
  { value: "720p", label: "720p" },
  { value: "480p", label: "480p" },
  { value: "360p", label: "360p" },
];

export const QualityControl = ({
  onQualityChange,
  currentQuality,
}: QualityControlProps) => {
  return (
    <div className="flex items-center gap-2">
      <Hint label="Video Quality" asChild>
        <div className="flex items-center gap-1">
          <Settings className="h-5 w-5 text-white" />
          <Select value={currentQuality} onValueChange={onQualityChange}>
            <SelectTrigger className="w-[80px] h-8 bg-transparent border-none text-white text-xs hover:bg-white/10 focus:ring-0 focus:ring-offset-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-700">
              {qualityOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-white hover:bg-neutral-800 focus:bg-neutral-800"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Hint>
    </div>
  );
};
