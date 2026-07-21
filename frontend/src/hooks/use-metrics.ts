import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useNodeMetrics(clusterId: string | null) {
  return useQuery({
    queryKey: ["metrics", "nodes", clusterId],
    queryFn: async () => {
      const response = await api.get(`/metrics/nodes?clusterId=${clusterId}`);
      return response.data.data || response.data;
    },
    enabled: !!clusterId,
    refetchInterval: 10000, // Refetch every 10 seconds to build chart data
  });
}

export function usePodMetrics(clusterId: string | null) {
  return useQuery({
    queryKey: ["metrics", "pods", clusterId],
    queryFn: async () => {
      const response = await api.get(`/metrics/pods?clusterId=${clusterId}`);
      return response.data.data || response.data;
    },
    enabled: !!clusterId,
    refetchInterval: 10000, // Refetch every 10 seconds to build chart data
  });
}
