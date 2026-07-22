# RhOps AI Architecture & Strategy Decisions

This document tracks major architectural decisions, industry standards, and the long-term technical strategy for RhOps AI.

## 1. Connecting to User Clusters

When connecting RhOps AI to a user's Kubernetes cluster, we have two primary modes of operation depending on the user's size and security requirements.

### Mode A: Kubeconfig / Service Account Token (MVP & Startups)
- **How it works:** The user provides a restricted `kubeconfig` or Service Account Token via the UI. RhOps AI uses this to authenticate against their Kubernetes API over the internet.
- **Pros:** Extremely fast onboarding. Immediate time-to-value.
- **Cons:** Only works if the cluster's API server is publicly accessible. Security teams at mid-to-large enterprises will typically block this.
- **Status:** **Active**. This is our primary go-to-market strategy for early adopters and MVP.

### Mode B: The In-Cluster Agent (Enterprise Standard)
- **How it works:** The user runs `kubectl apply -f https://rhops.ai/install-agent.yaml` in their cluster. A lightweight pod connects *outbound* to the RhOps AI backend via WebSocket or gRPC.
- **Pros:** The ultimate enterprise solution. Bypasses strict inbound firewalls. Zero credential sharing (we never hold their `kubeconfig`). 
- **Cons:** Requires the user to run commands in their terminal. Slight friction during onboarding.
- **Status:** **Planned**. We will build this as we scale and start targeting larger organizations with strict security postures.

---

## 2. GitHub Integration & Auto-Remediation

Instead of directly mutating the live cluster when the AI Copilot suggests a fix (e.g., bumping memory limits), RhOps AI treats **GitHub as the single source of truth**.

### The Workflow:
1. **Detection:** RhOps AI reads live metrics from the cluster via the connection established above.
2. **Analysis:** It fetches the associated Kubernetes YAML manifests directly from the user's GitHub repository.
3. **Remediation via Pull Request:** When the Copilot determines a fix, it does **not** run `kubectl apply`. Instead, it opens a Pull Request on the user's GitHub repository containing the modified YAML.
4. **Deployment:** The user merges the PR. Their existing tools (see below) handle the actual deployment to the cluster.

### Why this is Production-Grade:
- **No Configuration Drift:** The cluster state always matches the Git repository.
- **Zero Friction:** Users do not need to install ArgoCD or change their workflow to use our product.
- **Security & Auditability:** Every fix goes through standard code review and leaves an audit trail in Git history.

### Supported Deployment Tools:
Because we output fixes as Pull Requests, we are universally compatible with how users deploy today:
- **GitHub Actions:** The merged PR triggers their `deploy.yml` workflow to apply the YAMLs.
- **ArgoCD / Flux (GitOps):** The GitOps controller detects the merged PR and automatically pulls the changes into the cluster.

---

*Note: The raw `kubeconfig` file (which contains sensitive authentication credentials) is NEVER stored in a GitHub repository. Only the application configuration YAMLs (like deployments and services) live in GitHub.*
