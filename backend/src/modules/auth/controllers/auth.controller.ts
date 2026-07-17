import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { Prisma } from '@prisma/client';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userData = request.body as Prisma.UserCreateInput;
      const user = await this.authService.registerUser(userData);
      return reply.code(201).send({
        success: true,
        data: user,
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
