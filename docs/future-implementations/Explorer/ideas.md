# Cluster Explorer Future Implementations

## 1. Deep Resource Inspection
Currently, the UI provides high-level aggregation. The Explorer tab should allow deep dives into individual resources.
*   **Live Logs:** Stream logs from individual Pods directly into the UI (similar to `kubectl logs -f`).
*   **YAML Editor:** View and edit the raw YAML of any resource (Deployments, Services, ConfigMaps) and apply changes instantly.
*   **Exec Shell:** A Web Terminal that opens an interactive shell inside a running container (like `kubectl exec -it`).

## 2. Workload Management Actions
Provide UI buttons to perform common operational tasks without touching the CLI.
*   Restart Deployments / Pods.
*   Scale up / Scale down replicas.
*   Pause / Resume CronJobs.

## 3. Resource Relationships
When inspecting a Service, clearly show the associated Endpoints and the Pods backing it. When inspecting a Pod, show its parent ReplicaSet and Deployment.
