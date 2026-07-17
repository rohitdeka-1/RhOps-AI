import { FastifyInstance } from 'fastify';
import { RegisterController } from '../controllers/register.controller';
import { LoginController } from '../controllers/login.controller';
import { MeController } from '../controllers/me.controller';
import { LogoutController } from '../controllers/logout.controller';
import { RefreshTokenController } from '../controllers/refresh-token.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  const registerController = new RegisterController();
  const loginController = new LoginController();
  const meController = new MeController();
  const logoutController = new LogoutController();
  const refreshTokenController = new RefreshTokenController();

  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string' }
        }
      }
    }
  }, registerController.register);


  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, loginController.login);

  fastify.get('/me', {
    preValidation: [fastify.authenticate]
  }, meController.me);

  fastify.post('/logout', logoutController.logout);
  fastify.post('/refresh', refreshTokenController.refresh);

}
