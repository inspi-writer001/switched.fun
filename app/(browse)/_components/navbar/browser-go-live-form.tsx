"use client";

import React from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";

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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useBrowserStream } from "@/hooks/use-browser-stream";

const FormSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Title must be at least 2 characters.",
    })
    .max(100, {
      message: "Title must be less than 100 characters.",
    }),
});

interface BrowserGoLiveFormProps {
  user: {
    id: string;
    username?: string;
  } | null;
  onSuccess?: () => void;
}

export const BrowserGoLiveForm = ({ user, onSuccess }: BrowserGoLiveFormProps) => {
  const router = useRouter();
  const { createStream, isCreating } = useBrowserStream();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!user?.username) {
      toast.error("Username is not set. Please set your username first.");
      return;
    }

    createStream(data, {
      onSuccess: (result) => {
        if (result.success) {
          // Navigate to stream studio
          router.push(`/u/${user.username}`);
          onSuccess?.();
        }
      },
    });
  }

  // Security check: Only show for authenticated users
  if (!user?.id) {
    return null;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full max-w-[365px] mx-auto"
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

        <div className="flex justify-center">
          <Button
            disabled={form.formState.isSubmitting || !form.formState.isValid || isCreating}
            type="submit"
            className="px-8 h-12 font-semibold"
          >
            {isCreating ? "Creating Stream..." : "Go Live"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
