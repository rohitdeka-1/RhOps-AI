import { FastifyRequest, FastifyReply } from "fastify";
import { GithubAppService } from "../services/github-app.service";
import { prisma } from "../../../config/prisma";

export class GithubAppController {
  private githubAppService = new GithubAppService();

  install = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const slug = await this.githubAppService.getAppSlug();
      const installUrl = `https://github.com/apps/${slug}/installations/new`;
      return reply.send({ installUrl });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ message: "Failed to generate installation URL" });
    }
  };

  callback = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { installation_id, setup_action } = request.query as any;
      const user = (request as any).user;

      if (!installation_id) {
        return reply.code(400).send({ message: "Missing installation_id" });
      }

      // If user isn't on the request, it means the callback wasn't authenticated
      // GitHub redirects to this URL, so we need to ensure the user's JWT is passed 
      // via cookie or we just fail. Since we're using cookies for auth, it should work.
      if (!user) {
        return reply.code(401).send({ message: "Unauthorized. Please log in first." });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { githubInstallationId: String(installation_id) },
      });

      // Redirect back to frontend
      return reply.redirect("http://localhost:5173/");
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ message: "Failed to save installation ID", error: error.message || error });
    }
  };

  getRepos = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      if (!user) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      let installationId = dbUser?.githubInstallationId;

      if (!installationId) {
        // Fallback: Since this is a local dev environment, there's likely only one installation.
        // Let's check if the app is installed at all and grab the first installation ID.
        const token = this.githubAppService.getAppJwt();
        const axios = require('axios');
        const response = await axios.get("https://api.github.com/app/installations", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          }
        });

        if (response.data && response.data.length > 0) {
          installationId = response.data[0].id.toString();
          // Save it so we don't have to do this again
          await prisma.user.update({
            where: { id: user.id },
            data: { githubInstallationId: installationId },
          });
        } else {
          return reply.code(400).send({ message: "GitHub App not installed for this user" });
        }
      }

      const repos = await this.githubAppService.getInstallationRepositories(installationId);
      return reply.send({ data: repos });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ message: "Failed to fetch repositories" });
    }
  };
}
