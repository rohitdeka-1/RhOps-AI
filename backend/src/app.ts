import Fastify, { FastifyInstance } from 'fastify';

import helmet from '@fastify/helmet';
import authRoutes from './modules/auth/routes/auth.routes';
import corsPlugin from './plugins/cors';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true,
  });

  await app.register(helmet);
  await app.register(corsPlugin);

  app.register(async (api) => {

    api.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    api.register(authRoutes, { prefix: '/auth' });



  }, { prefix: '/api/v1' });

  return app;

};
