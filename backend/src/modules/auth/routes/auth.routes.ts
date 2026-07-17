import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  const authController = new AuthController();

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
  }, authController.register);
}
