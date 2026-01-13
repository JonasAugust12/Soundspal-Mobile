import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createApiCall } from "@/lib/apiClient";
import type {
  MediaListResponse,
  UploadMediaResponse,
} from "@/types/media.type";

// API Calls
const mediaApi = {
  getMyMedia: () => {
    return createApiCall<MediaListResponse, void>(
      "GET",
      "submissions/me/media"
    )();
  },

  uploadMedia: (formData: FormData) => {
    console.log("🔍 Sending FormData to /submissions/media");
    return createApiCall<UploadMediaResponse, FormData>(
      "POST",
      "submissions/media"
    )(formData);
  },

  deleteMedia: (id: string) => {
    return createApiCall<void, void>("DELETE", `submissions/me/media/${id}`)();
  },
};

// Query Keys
export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  myMedia: () => [...mediaKeys.lists(), "myMedia"] as const,
};

// Get My Media Hook
export const useGetMyMedia = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: mediaKeys.myMedia(),
    queryFn: () => mediaApi.getMyMedia(),
    enabled: options?.enabled !== false,
    staleTime: 60000, // 1 minute
  });
};

// Upload Media Hook
export const useUploadMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mediaApi.uploadMedia,
    onSuccess: () => {
      // Invalidate media list to refetch
      queryClient.invalidateQueries({ queryKey: mediaKeys.myMedia() });
    },
  });
};

// Delete Media Hook
export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mediaApi.deleteMedia,
    onSuccess: () => {
      // Invalidate media list
      queryClient.invalidateQueries({ queryKey: mediaKeys.myMedia() });
    },
  });
};
