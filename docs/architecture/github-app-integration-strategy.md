# GitHub App Integration Strategy (Vercel-Style)

This architectural decision record documents the implementation strategy for **RhOps AI GitHub App Integration**, enabling 1-click repository authorization, automatic private repository discovery, and real-time GitOps webhooks.

---

## 1. Overview & Business Value

Traditional CI/CD platforms require users to manually generate Personal Access Tokens (PATs) and paste them into forms. RhOps AI provides a **Vercel-style GitHub App integration**, allowing users to:
1. Click **"Install GitHub App"** in RhOps AI.
2. Grant access to specific public or private repositories on GitHub.
3. Automatically pick their repository from a dropdown in RhOps AI.
4. Receive automated Pull Requests (PRs) whenever RhOps AI suggests Kubernetes manifest remediations.

---

## 2. GitHub App vs. Personal Access Tokens (PATs)

| Feature | Personal Access Token (PAT) | GitHub App Integration (Vercel-Style) |
| :--- | :--- | :--- |
| **User Experience** | Manual creation, copying string token | 1-Click authorization prompt |
| **Security Scope** | Broad scope across user account | Restricted only to selected repositories |
| **Token Lifetime** | Long-lived (Months / Years) | Short-lived Installation Token (1 Hour) |
| **Webhooks** | Requires manual webhook creation | Automatic native event subscriptions |
| **Enterprise Readiness** | Medium (security teams flag long-lived tokens) | **High (Gold standard for enterprise platforms)** |

---

## 3. OAuth & Installation Sequence (Data Flow)

```
User                        RhOps AI Frontend              RhOps AI Backend                      GitHub API
 │                                  │                              │                                  │
 ├─ Click "Install GitHub App" ────►│                              │                                  │
 │                                  ├─ Redirect to GitHub Apps ───►│                                  │
 │                                  │  (github.com/apps/rhops-ai)  │                                  │
 ├─ Select Repositories & Install ───────────────────────────────────────────────────────────────────►│
 │                                                                                                    │
 │                                  ◄─ Redirect /api/github/callback ─────────────────────────────────┤
 │                                  │  with ?installation_id=123456                                   │
 │                                  │                              │                                  │
 │                                  ├─ Store installation_id ─────►│                                  │
 │                                  │                              ├─ Generate App JWT (RS256) ──────►│
 │                                  │                              ├─ Exchange JWT for Access Token ─►│
 │                                  │                              │  (valid 1 hour)                  │
 │                                  │                              │                                  │
 │                                  │  GET /api/github/repos       │                                  │
 │                                  ├─────────────────────────────►│ GET /installation/repositories  │
 │                                  │                              ├─────────────────────────────────►│
 │                                  │◄─ List of Public/Private Repos│◄─ JSON Array of Repos ──────────┤
 │                                  │                              │                                  │
 ├─ Select Repo from Dropdown ─────►│                              │                                  │
```

---

## 4. Backend Environment Configuration

To enable full GitHub App functionality in production, configure the following environment variables in `backend/.env`:

```env
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
```

---

## 5. Webhook Events & Automated GitOps

When installed, the GitHub App subscribes to the following events:

1. `push`: Triggers automatic manifest validation and synchronization state check.
2. `pull_request`: Tracks open remediation PRs opened by RhOps AI Copilot.
3. `repository`: Listens for repo creation or permission changes to dynamically update project options.

---

## 6. How Users Experience This Feature

1. Open **RhOps AI** Overview dashboard -> Click **+ New Project**.
2. Click **Install GitHub App (Vercel Style)** button.
3. Authorize the **RhOps AI GitHub App** on GitHub.
4. Return to RhOps AI and select any public or private repository directly from the dynamic dropdown.
