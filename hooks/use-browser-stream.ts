import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { 
  createBrowserStreamAction, 
  startBrowserStreamAction, 
  stopBrowserStreamAction, 
  updateBrowserStreamTitleAction,
  getHostTokenAction 
} from "@/actions/browser-stream";
import { getBrowserStreamData } from "@/lib/browser-stream-service";

export function useBrowserStream() {
  const queryClient = useQueryClient();

  const { data: streamData, isLoading, error } = useQuery({
    queryKey: ["browser-stream"],
    queryFn: async () => {
      const result = await getBrowserStreamData();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.stream;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const createStreamMutation = useMutation({
    mutationFn: createBrowserStreamAction,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Browser stream created successfully!");
        queryClient.invalidateQueries({ queryKey: ["browser-stream"] });
      } else {
        toast.error(data.error || "Failed to create browser stream");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create browser stream");
    },
  });

  const startStreamMutation = useMutation({
    mutationFn: startBrowserStreamAction,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Stream started successfully!");
        queryClient.invalidateQueries({ queryKey: ["browser-stream"] });
      } else {
        toast.error(data.error || "Failed to start stream");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to start stream");
    },
  });

  const stopStreamMutation = useMutation({
    mutationFn: stopBrowserStreamAction,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Stream stopped successfully!");
        queryClient.invalidateQueries({ queryKey: ["browser-stream"] });
      } else {
        toast.error(data.error || "Failed to stop stream");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to stop stream");
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: updateBrowserStreamTitleAction,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Stream title updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["browser-stream"] });
      } else {
        toast.error(data.error || "Failed to update stream title");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update stream title");
    },
  });

  const getHostTokenMutation = useMutation({
    mutationFn: getHostTokenAction,
    onError: (error: any) => {
      toast.error(error.message || "Failed to get host token");
    },
  });

  return {
    stream: streamData,
    isLoading,
    error,
    isLive: streamData?.isLive || false,
    createStream: createStreamMutation.mutate,
    startStream: startStreamMutation.mutate,
    stopStream: stopStreamMutation.mutate,
    updateTitle: updateTitleMutation.mutate,
    getHostToken: getHostTokenMutation.mutate,
    isCreating: createStreamMutation.isPending,
    isStarting: startStreamMutation.isPending,
    isStopping: stopStreamMutation.isPending,
    isUpdatingTitle: updateTitleMutation.isPending,
    isGettingToken: getHostTokenMutation.isPending,
  };
} 