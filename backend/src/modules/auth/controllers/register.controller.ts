import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterService } from '../services/register.service';
import { RefreshTokenService } from '../services/refreshToken.service';
import { Prisma } from '@prisma/client';


export class RegisterController {
  private registerService: RegisterService;
  private refreshTokenService: RefreshTokenService;

  constructor() {
    this.registerService = new RegisterService();
    this.refreshTokenService = new RefreshTokenService();
  }

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userData = request.body as Prisma.UserCreateInput;
      const user = await this.registerService.registerUser(userData);

      const token = await reply.jwtSign({
        id: user.id,

        email: user.email,
        username: user.username,
        role: user.role
      }, { expiresIn: '15m' });

      const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);

      reply.setCookie('access_token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60
      });

      reply.setCookie('refresh_token', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60
      });

      return reply.code(201).send({
        success: true,
        data: user,
        token,
        message: 'User registered successfully',
      });
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return reply.code(400).send({
          success: false,
          message: error.message,
        });
      }
      request.log.error(error);
      return reply.code(500).send({
        success: false,
        message: 'Internal Server Error',
      });
    }
  }
}
