import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Cluster {
  id: string;
  name: string;
  provider: string;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export function useClusters() {
  return useQuery<Cluster[]>({
    queryKey: ["clusters"],
    queryFn: async () => {
      const response = await api.get("/clusters");
      return response.data.data || response.data;
    },
  });
}

export function useConnectCluster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/clusters/connect", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
    },
  });
}
