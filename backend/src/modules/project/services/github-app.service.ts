import jwt from "jsonwebtoken";
import axios from "axios";

export class GithubAppService {
  private appId = process.env.GITHUB_APP_ID as string;
  private privateKey = process.env.GITHUB_PRIVATE_KEY as string;

  constructor() {
    if (this.privateKey) {
      // Replace literal \n with actual newlines if it was loaded from env incorrectly
      this.privateKey = this.privateKey.replace(/\\n/g, "\n");
    }
  }

  /**
   * Generates a short-lived JWT to authenticate as the GitHub App itself
   */
  public getAppJwt(): string {
    if (!this.appId || !this.privateKey) {
      throw new Error("GitHub App credentials not configured");
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iat: now - 60, // Issued at time (60 seconds in the past to allow for clock drift)
      exp: now + 10 * 60, // JWT expiration time (10 minute maximum)
      iss: this.appId, // GitHub App ID
    };

    return jwt.sign(payload, this.privateKey, { algorithm: "RS256" });
  }

  /**
   * Fetches the app slug/name from GitHub API to construct the installation URL
   */
  public async getAppSlug(): Promise<string> {
    const token = this.getAppJwt();
    const response = await axios.get("https://api.github.com/app", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    return response.data.slug;
  }

  /**
   * Generates an installation access token for a specific installation ID
   */
  public async getInstallationToken(installationId: string): Promise<string> {
    const token = this.getAppJwt();
    const response = await axios.post(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    return response.data.token;
  }

  /**
   * Fetches all repositories accessible by the given installation
   */
  public async getInstallationRepositories(installationId: string): Promise<any[]> {
    const accessToken = await this.getInstallationToken(installationId);
    
    // We should handle pagination, but for now we'll fetch up to 100
    const response = await axios.get("https://api.github.com/installation/repositories?per_page=100", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    return response.data.repositories.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      url: repo.html_url,
      private: repo.private,
      defaultBranch: repo.default_branch,
    }));
  }
}
