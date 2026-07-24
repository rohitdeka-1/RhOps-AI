# GitHub Repository & Kubernetes YAML Integration Guide

This guide documents the complete technical implementation of the **Vercel-style GitHub App Integration** and Kubernetes YAML manifest upload features during project creation in **RhOps AI**.

---

## 1. Overview & Core Objectives

### Why Connect GitHub Repositories & Kubernetes Manifests?
In modern cloud-native software engineering (GitOps), infrastructure should be **declarative, version-controlled, and reproducible**.

- **Single Source of Truth**: Storing the repository URL (`gitRepoUrl`), branch (`gitBranch`), and manifest file path (`manifestPath`) ensures the cluster state can be tracked back to source code.
- **Support for Private Repositories**: Enterprise & private projects require secure token authentication. We use a **GitHub App** to dynamically generate short-lived Installation Tokens, entirely removing the need for manual Personal Access Tokens (PATs).
- **GitOps Readiness**: Connecting a GitHub App allows RhOps AI to fetch manifests dynamically or open pull requests (PRs) when AI remediation recommendations are accepted.
- **Declarative Manifest Storage**: Uploading or pasting direct YAML manifests (`yamlContent`) allows immediate previewing, dry-running, and AI-driven troubleshooting before cluster application.

---

## 2. System Architecture & Data Flow

```text
+-----------------------------------------------------------------------------------+
|                                 FRONTEND (React)                                  |
|                                                                                   |
|  CreateProjectDialog (Vercel-style Import Git Repository)                         |
|    - Connect GitHub App -> Fetches Installation URL                               |
|    - Lists authorized repositories via useGithubRepos hook                        |
|        │                                                                          |
|        ▼ (payload: name, gitRepoUrl, gitBranch, manifestPath)                     |
|  useCreateProject Hook (Axios -> POST /projects/create)                           |
+--------------------------------─────────┬-----------------------------------------+
                                          │ HTTP POST /projects/create
                                          ▼
+-----------------------------------------------------------------------------------+
|                                 BACKEND (Fastify)                                 |
|                                                                                   |
|  GithubAppController -> Handles /install, /callback, /repos                       |
|  GithubAppService -> Generates RS256 JWTs, fetches Installation Tokens            |
+--------------------------------─────────┬-----------------------------------------+
                                          │ Prisma Client
                                          ▼
+-----------------------------------------------------------------------------------+
|                              DATABASE (PostgreSQL / Neon)                         |
|                                                                                   |
|  User Table: stores githubInstallationId                                          |
|  Project Table: stores gitRepoUrl, gitBranch, manifestPath                        |
+-----------------------------------------------------------------------------------+
```

---

## 3. Step-by-Step Technical Implementation

### Step 1: Database Schema Expansion (`schema.prisma`)
**File**: `backend/prisma/schema.prisma`  
**Reasoning**: We added `githubInstallationId` to the `User` model to permanently link a user's GitHub App installation to their RhOps account.

```prisma
model User {
  id                   String        @id @default(uuid())
  ...
  githubInstallationId String?
}

model Project {
  id           String    @id @default(uuid())
  ...
  gitRepoUrl   String?
  gitBranch    String?   @default("main")
  manifestPath String?   @default("k8s/deployment.yaml")
}
```

---

### Step 2: GitHub App Service (`github-app.service.ts`)
**File**: `backend/src/modules/project/services/github-app.service.ts`

Handles cryptography and GitHub API communication:
1. **`getAppJwt()`**: Reads the `GITHUB_PRIVATE_KEY` and signs a JSON Web Token (JWT) using the `RS256` algorithm. This JWT proves our identity as the GitHub App.
2. **`getInstallationToken()`**: Exchanges the App JWT for a short-lived (1 hour) Installation Access Token for a specific user's `githubInstallationId`.
3. **`getInstallationRepositories()`**: Uses the Installation Access Token to fetch all public and private repositories the user granted access to.

---

### Step 3: GitHub Routes & Controllers (`github.controller.ts`)
**File**: `backend/src/modules/project/controllers/github.controller.ts`

Exposes three critical endpoints:
- `GET /github/install`: Generates the OAuth-like installation URL (`https://github.com/apps/{slug}/installations/new`).
- `GET /github/callback`: Intercepts GitHub's redirect post-installation, extracts the `installation_id`, and saves it to the `User` record in the database.
- `GET /github/repos`: Uses the `githubInstallationId` to fetch the user's authorized repositories. **Note**: Includes an Auto-Recovery mechanism that queries GitHub for the installation ID if it goes missing from the local database.

---

### Step 4: Authentication Cookies (Lax)
**File**: `backend/src/modules/auth/controllers/*.ts`

**Reasoning**: GitHub performs a top-level cross-site redirect back to our `/github/callback` endpoint. To ensure the user's authentication cookies are sent during this redirect, we set `sameSite: 'lax'` for all JWT cookies.

---

### Step 5: Frontend Vercel-style UI (`create-project-dialog.tsx`)
**File**: `frontend/src/pages/overview/components/create-project-dialog.tsx`

Features a 2-step wizard:
1. **Select Source**: Shows a "Connect GitHub App" button if not installed. If installed, renders a searchable, scrollable list of repositories with "Import" buttons.
2. **Configure Deployment**: Automatically inherits the repository name and allows the user to specify the target branch and manifest path before deploying.

---

## 4. How to Test & Verify

1. **Clean Slate**: Ensure your `githubInstallationId` is null in the database.
2. **Connect**: Open the "New Project" dialog and click "Connect GitHub App".
3. **Authorize**: You will be redirected to GitHub to select which repositories to grant access to.
4. **Auto-Redirect**: Upon saving, you are redirected back to RhOps.
5. **View Repos**: Re-open the "New Project" dialog; your authorized repositories will instantly populate in the UI.
