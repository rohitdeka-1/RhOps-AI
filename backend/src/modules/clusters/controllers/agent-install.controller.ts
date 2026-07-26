import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../../config/prisma";

export class AgentInstallController {

  getInstallManifest = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };

      // Verify cluster exists
      const cluster = await prisma.cluster.findUnique({
        where: { id }
      });

      if (!cluster) {
        return reply.code(404).send({ message: "Cluster not found" });
      }

      let defaultBackendUrl = `${request.protocol}://${request.headers.host}`;
      if (defaultBackendUrl.includes('localhost')) {
          defaultBackendUrl = defaultBackendUrl.replace('localhost', 'host.docker.internal');
      }
      const backendUrl = process.env.RHOPS_BACKEND_URL || defaultBackendUrl;

      const manifest = `
apiVersion: v1
kind: Namespace
metadata:
  name: rhops-system
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: rhops-agent
  namespace: rhops-system
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: rhops-agent-role
rules:
- apiGroups: ["", "apps", "batch", "extensions"]
  resources: ["pods", "services", "endpoints", "persistentvolumeclaims", "events", "configmaps", "secrets", "namespaces", "nodes", "deployments", "replicasets", "daemonsets", "statefulsets", "jobs", "cronjobs"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["pods/log"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: rhops-agent-rolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: rhops-agent-role
subjects:
- kind: ServiceAccount
  name: rhops-agent
  namespace: rhops-system
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rhops-agent
  namespace: rhops-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rhops-agent
  template:
    metadata:
      labels:
        app: rhops-agent
    spec:
      serviceAccountName: rhops-agent
      containers:
      - name: agent
        image: rohitdeka/rhdopsai:latest
        imagePullPolicy: Always
        env:
        - name: RHOPS_CLUSTER_TOKEN
          value: "${cluster.id}"
        - name: RHOPS_BACKEND_URL
          value: "${backendUrl}"
`;

      reply.header('Content-Type', 'text/yaml');
      return reply.send(manifest);
    } catch (error: any) {
      return reply.code(500).send({ message: error.message });
    }
  }
}
