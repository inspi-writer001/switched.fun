"use client";

import React from "react";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FormSchema = z
  .object({
    title: z
      .string()
      .min(2, {
        message: "Title must be at least 2 characters.",
      })
      .max(100, {
        message: "Title must be less than 100 characters.",
      }),
    scheduledDate: z.date({
      required_error: "Please select a date.",
    }),
    scheduledTime: z.string().min(1, {
      message: "Please select a time.",
    }),
  })
  .refine(
    (data) => {
      // Combine date and time and validate it's in the future
      const [hours, minutes] = data.scheduledTime.split(":").map(Number);
      const scheduledDateTime = new Date(data.scheduledDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      const now = new Date();

      // Add 5 minutes buffer to allow for form submission time
      const minScheduledTime = new Date(now.getTime() + 5 * 60 * 1000);

      return scheduledDateTime > minScheduledTime;
    },
    {
      message: "Scheduled time must be at least 5 minutes in the future.",
      path: ["scheduledTime"], // Show error on time field
    }
  );

type FormData = z.infer<typeof FormSchema>;

// Generate time options in 15-minute intervals
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      times.push(timeString);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export const ScheduleStreamForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      scheduledDate: undefined,
      scheduledTime: "",
    },
  });

  function onSubmit(data: FormData) {
    const [hours, minutes] = data.scheduledTime.split(":").map(Number);
    const scheduledDateTime = new Date(data.scheduledDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    toast.success("Stream scheduled successfully!", {
      description: `Your stream is scheduled for ${scheduledDateTime.toLocaleString()}`,
    });

    // Reset form
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full max-w-[365px] mx-auto"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-foreground px-3">
                Stream Title *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your stream title"
                  {...field}
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm text-foreground px-3">
                  Date *
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-12 w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        // Disable past dates
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduledTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-foreground px-3">
                  Time *
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            className="px-8 h-12 font-semibold"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
          >
            {form.formState.isSubmitting ? "Scheduling..." : "Schedule Stream"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
