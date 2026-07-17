import Fastify, { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import authRoutes from './modules/auth/routes/auth.routes';
import clusterRoutes from './modules/clusters/routes/clusters.routes';
import corsPlugin from './plugins/cors';
import jwtPlugin from './plugins/jwt';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true,
  });

  await app.register(helmet);
  await app.register(cookie);
  await app.register(corsPlugin);
  await app.register(jwtPlugin);
  await app.register(multipart, {
    attachFieldsToBody: true
  });

  app.register(async (api) => {

    api.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    api.register(authRoutes, { prefix: '/auth' });
    api.register(clusterRoutes, { prefix: '/clusters' });
  }, { prefix: '/api/v1' });

  return app;

};
