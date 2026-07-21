import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useNodes(clusterId: string | null) {
  return useQuery({
    queryKey: ["nodes", clusterId],
    queryFn: async () => {
      const response = await api.get(`/nodes?clusterId=${clusterId}`);
      return response.data.data || response.data;
    },
    enabled: !!clusterId,
    refetchInterval: 10000,
  });
}

export function usePods(clusterId: string | null) {
  return useQuery({
    queryKey: ["pods", clusterId],
    queryFn: async () => {
      const response = await api.get(`/pods?clusterId=${clusterId}&namespace=all`);
      return response.data.data || response.data;
    },
    enabled: !!clusterId,
    refetchInterval: 5000,
  });
}

export function useDeployments(clusterId: string | null) {
  return useQuery({
    queryKey: ["deployments", clusterId],
    queryFn: async () => {
      const response = await api.get(`/deployments?clusterId=${clusterId}&namespace=all`);
      return response.data.data || response.data;
    },
    enabled: !!clusterId,
    refetchInterval: 10000,
  });
}

export function useServices(clusterId: string | null) {
  return useQuery({
    queryKey: ["services", clusterId],
    queryFn: async () => {
      const response = await api.get(`/services?clusterId=${clusterId}&namespace=all`);
      return response.data.data || response.data;
    },
    enabled: !!clusterId,
    refetchInterval: 10000,
  });
}

export function useNamespaces(clusterId: string | null) {
  return useQuery({
    queryKey: ["namespaces", clusterId],
    queryFn: async () => {
      // Trying both common formats depending on implementation
      try {
        const response = await api.get(`/namespaces?clusterId=${clusterId}`);
        return response.data.data || response.data;
      } catch (e) {
        // Fallback to cluster route
        const response = await api.get(`/clusters/${clusterId}/namespaces`);
        return response.data.data || response.data;
      }
    },
    enabled: !!clusterId,
    refetchInterval: 60000,
  });
}

export function useEvents(clusterId: string | null) {
  return useQuery({
    queryKey: ["events", clusterId],
    queryFn: async () => {
      const response = await api.get(`/events?clusterId=${clusterId}`);
      return response.data.data || response.data;
    },
    enabled: !!clusterId,
    refetchInterval: 15000, // Faster refetch for events
  });
}
