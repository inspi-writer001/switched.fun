"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface ScheduleStreamProps {
  user: {
    id: string;
    username?: string;
  } | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ScheduleStream = ({ user, open = false, onOpenChange }: ScheduleStreamProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
  });

  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScheduleStream = async () => {
    if (!user?.username) {
      toast.error("Username is not set. Please set your username first.");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a stream title");
      return;
    }

    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: Implement schedule stream API call
      // const result = await scheduleStream({
      //   title: formData.title,
      //   description: formData.description,
      //   scheduledAt: new Date(`${formData.scheduledDate}T${formData.scheduledTime}`),
      //   userId: user.id
      // });

      toast.success("Stream scheduled successfully!");
      onOpenChange?.(false);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        scheduledDate: "",
        scheduledTime: "",
      });
    } catch (error) {
      console.error("Error scheduling stream:", error);
      toast.error("Failed to schedule stream");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewScheduled = () => {
    if (!user?.username) {
      toast.error("Username is not set. Please set your username first.");
      return;
    }
    router.push(`/u/${user.username}/scheduled`);
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Schedule Stream
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="rounded-xl bg-muted/50 p-4 flex items-start gap-x-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Schedule your stream:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Set a title and description for your stream</li>
                <li>Choose a date and time for your stream</li>
                <li>View and manage all your scheduled streams</li>
                <li>Get notifications before your stream starts</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Stream Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter stream title"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter stream description (optional)"
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-x-2">
            <Button
              variant="secondary"
              onClick={handleViewScheduled}
              className="font-semibold"
            >
              View Scheduled
            </Button>
            <Button
              variant="primary"
              onClick={handleScheduleStream}
              disabled={isLoading}
              className="font-semibold"
            >
              {isLoading ? "Scheduling..." : "Schedule Stream"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 