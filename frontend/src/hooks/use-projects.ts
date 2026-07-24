import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Project {
  id: string;
  name: string;
  gitRepoUrl?: string | null;
  gitBranch?: string | null;
  manifestPath?: string | null;
  isPrivate?: boolean | null;
  gitToken?: string | null;
  githubInstallationId?: string | null;
  yamlContent?: string | null;
  syncStatus?: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  userId?: string;
}

export interface CreateProjectPayload {
  name: string;
  gitRepoUrl?: string;
  gitBranch?: string;
  manifestPath?: string;
  isPrivate?: boolean;
  gitToken?: string;
  githubInstallationId?: string;
  yamlContent?: string;
  syncStatus?: string;
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get<{ data: Project[] }>("/projects");
      return res.data.data;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProjectPayload | string) => {
      const body = typeof payload === "string" ? { name: payload } : payload;
      const res = await api.post<{ data: Project }>("/projects/create", body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/projects/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useGithubRepos() {
  return useQuery({
    queryKey: ["github-repos"],
    queryFn: async () => {
      const res = await api.get<{ data: any[] }>("/projects/github/repos");
      return res.data.data;
    },
    retry: false,
  });
}

export const installGithubApp = async () => {
  const res = await api.get<{ installUrl: string }>("/projects/github/install");
  window.location.href = res.data.installUrl;
};
