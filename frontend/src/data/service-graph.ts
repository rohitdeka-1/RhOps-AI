export type ServiceStatus = "healthy" | "warning" | "critical" | "pending";

export type ServiceKind =
  | "ingress"
  | "proxy"
  | "auth"
  | "service"
  | "worker"
  | "database"
  | "cache"
  | "queue"
  | "frontend";

export interface ServiceNode {
  id: string;
  label: string;
  kind: ServiceKind;
  status: ServiceStatus;
  replicas: number;
  region: string;
  image: string;
  x: number;
  y: number;
}

export interface ServiceEdge {
  id: string;
  from: string;
  to: string;
  protocol: "http" | "grpc" | "tcp" | "postgres" | "redis";
}

export interface ServiceGraph {
  name: string;
  environment: string;
  nodes: ServiceNode[];
  edges: ServiceEdge[];
}

export const serviceGraph: ServiceGraph = {
  name: "production-us-east",
  environment: "production",
  nodes: [
    {
      id: "ingress",
      label: "Ingress",
      kind: "ingress",
      status: "healthy",
      replicas: 2,
      region: "us-east-1",
      image: "nginx-ingress:1.11.1",
      x: 60,
      y: 260,
    },
    {
      id: "proxy",
      label: "Reverse Proxy",
      kind: "proxy",
      status: "healthy",
      replicas: 3,
      region: "us-east-1",
      image: "envoy:1.31.0",
      x: 280,
      y: 260,
    },
    {
      id: "frontend",
      label: "Frontend",
      kind: "frontend",
      status: "healthy",
      replicas: 4,
      region: "us-east-1",
      image: "web-app:2.14.0",
      x: 500,
      y: 80,
    },
    {
      id: "auth",
      label: "Auth Service",
      kind: "auth",
      status: "healthy",
      replicas: 3,
      region: "us-east-1",
      image: "auth-svc:1.9.2",
      x: 500,
      y: 260,
    },
    {
      id: "backend",
      label: "Backend API",
      kind: "service",
      status: "warning",
      replicas: 5,
      region: "us-east-1",
      image: "api-server:3.2.7",
      x: 500,
      y: 440,
    },
    {
      id: "billing",
      label: "Billing Worker",
      kind: "worker",
      status: "critical",
      replicas: 1,
      region: "us-east-1",
      image: "billing-worker:0.8.1",
      x: 740,
      y: 520,
    },
    {
      id: "queue",
      label: "Job Queue",
      kind: "queue",
      status: "healthy",
      replicas: 2,
      region: "us-east-1",
      image: "rabbitmq:3.13",
      x: 740,
      y: 380,
    },
    {
      id: "cache",
      label: "Redis Cache",
      kind: "cache",
      status: "healthy",
      replicas: 2,
      region: "us-east-1",
      image: "redis:7.4",
      x: 740,
      y: 240,
    },
    {
      id: "postgres",
      label: "PostgreSQL",
      kind: "database",
      status: "healthy",
      replicas: 3,
      region: "us-east-1",
      image: "postgres:16.3",
      x: 960,
      y: 340,
    },
  ],
  edges: [
    { id: "e1", from: "ingress", to: "proxy", protocol: "http" },
    { id: "e2", from: "proxy", to: "frontend", protocol: "http" },
    { id: "e3", from: "proxy", to: "auth", protocol: "http" },
    { id: "e4", from: "proxy", to: "backend", protocol: "http" },
    { id: "e5", from: "frontend", to: "backend", protocol: "http" },
    { id: "e6", from: "backend", to: "auth", protocol: "grpc" },
    { id: "e7", from: "backend", to: "cache", protocol: "redis" },
    { id: "e8", from: "backend", to: "queue", protocol: "tcp" },
    { id: "e9", from: "backend", to: "postgres", protocol: "postgres" },
    { id: "e10", from: "auth", to: "postgres", protocol: "postgres" },
    { id: "e11", from: "queue", to: "billing", protocol: "tcp" },
    { id: "e12", from: "billing", to: "postgres", protocol: "postgres" },
  ],
};
