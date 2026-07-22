import { FastifyInstance } from 'fastify';
import { RegisterController } from '../controllers/register.controller';
import { LoginController } from '../controllers/login.controller';
import { MeController } from '../controllers/me.controller';
import { LogoutController } from '../controllers/logout.controller';
import { RefreshTokenController } from '../controllers/refresh-token.controller';
import { GithubController } from '../controllers/github.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  const registerController = new RegisterController();
  const loginController = new LoginController();
  const meController = new MeController();
  const logoutController = new LogoutController();
  const refreshTokenController = new RefreshTokenController();
  const githubController = new GithubController();

  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'username'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string' },
          username: { type: 'string', minLength: 3 }
        },
        additionalProperties: false
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
        },
        additionalProperties: false
      }
    }
  }, loginController.login);

  fastify.get('/me', {
    preValidation: [fastify.authenticate]
  }, meController.me);

  fastify.post('/logout', logoutController.logout);
  fastify.post('/refresh', refreshTokenController.refresh);
  
  fastify.post('/github', {
    schema: {
      body: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string' }
        },
        additionalProperties: false
      }
    }
  }, githubController.handleCallback);

}
