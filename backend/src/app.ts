import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import authRoutes from './modules/auth/routes/auth.routes';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true,
  });

  // Register plugins
  await app.register(cors);
  await app.register(helmet);

  // Register routes
  app.register(authRoutes, { prefix: '/api/auth' });

  // Health check route
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;

};
