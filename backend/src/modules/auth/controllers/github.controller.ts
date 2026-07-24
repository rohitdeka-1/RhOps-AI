import { FastifyRequest, FastifyReply } from "fastify";
import { AuthRepository } from "../repositories/auth.repository";
import { RefreshTokenService } from "../services/refreshToken.service";
import bcrypt from "bcrypt";
import crypto from "crypto";

export class GithubController {
  private authRepository: AuthRepository;
  private refreshTokenService: RefreshTokenService;

  constructor() {
    this.authRepository = new AuthRepository();
    this.refreshTokenService = new RefreshTokenService();
  }

  handleCallback = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { code } = request.body as { code: string };

      if (!code) {
        return reply.code(400).send({ message: "Authorization code is required" });
      }

      // 1. Exchange code for access token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return reply.code(400).send({ message: tokenData.error_description || "Failed to get access token from GitHub" });
      }

      const accessToken = tokenData.access_token;

      // 2. Fetch user profile from GitHub
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      const githubUser = await userResponse.json();

      if (!githubUser.id) {
        return reply.code(400).send({ message: "Failed to fetch user profile from GitHub" });
      }

      // 3. Fetch user emails
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      const githubEmails = await emailsResponse.json();
      const primaryEmail = githubEmails.find((email: any) => email.primary)?.email || githubEmails[0]?.email;

      if (!primaryEmail) {
        return reply.code(400).send({ message: "No email associated with GitHub account" });
      }

      // 4. Find or Create User
      let user = await this.authRepository.findUserByEmail(primaryEmail);

      if (!user) {
        // Create new user
        const randomPassword = crypto.randomBytes(16).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        let username = githubUser.login;
        // Check if username is taken, append random if so
        const existingUsername = await this.authRepository.findUsernameOrEmail('', username);
        if (existingUsername) {
          username = `${username}_${crypto.randomBytes(4).toString("hex")}`;
        }

        user = await this.authRepository.createUser({
          email: primaryEmail,
          username: username,
          name: githubUser.name || githubUser.login,
          password: hashedPassword,
        });
      }

      // 5. Generate JWT and Refresh Token
      const token = await reply.jwtSign(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        { expiresIn: "15m" }
      );

      const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

      reply.setCookie("access_token", token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
      });

      reply.setCookie("refresh_token", refreshToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      const { password, ...userWithoutPassword } = user;

      return reply.code(200).send({
        success: true,
        data: userWithoutPassword,
        message: "GitHub login success",
        token: token,
      });
    } catch (err: any) {
      console.error("GitHub Auth Error:", err);
      return reply.code(500).send({ message: "Internal server error during GitHub authentication" });
    }
  };
}
