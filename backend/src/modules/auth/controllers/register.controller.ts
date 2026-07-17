import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterService } from '../services/register.service';
import { Prisma } from '@prisma/client';


export class RegisterController {
  private registerService: RegisterService;

  constructor() {
    this.registerService = new RegisterService();
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
      });

      reply.setCookie('access_token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24
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
