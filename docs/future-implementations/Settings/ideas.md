# Settings & Integrations Future Implementations

## 1. Alerts & Notifications
Configure alerts based on cluster health and metrics.
*   **Slack/Discord Integration:** Send a message to a channel when a node goes offline or error rates spike.
*   **Email Notifications:** Daily summaries of cluster resource usage and billing estimates.

## 2. RBAC (Role-Based Access Control)
Manage who can see and do what within the RhOps AI dashboard.
*   Map GitHub Teams/Organizations to Kubernetes Namespaces.
*   Read-only modes for junior developers (they can view logs and metrics but cannot execute scale/restart commands).

## 3. GitOps Integrations
Deep integration with ArgoCD or Flux.
*   Show sync status of applications directly in the dashboard.
*   Trigger manual syncs or view diffs between the live cluster state and the Git repository state.
