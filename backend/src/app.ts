import Fastify, { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import authRoutes from './modules/auth/routes/auth.routes';
import clusterRoutes from './modules/clusters/routes/clusters.routes';
import projectRoutes from './modules/project/routes/project.routes';
import podsRoutes from './modules/pods/routes/pods.routes';
import deploymentsRoutes from './modules/deployments/routes/deployments.routes';
import servicesRoutes from './modules/services/routes/services.routes';
import namespacesRoutes from './modules/namespaces/routes/namespaces.routes';
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
    api.register(projectRoutes, { prefix: '/projects' });
    api.register(podsRoutes, { prefix: '/pods' });
    api.register(deploymentsRoutes, { prefix: '/deployments' });
    api.register(servicesRoutes, { prefix: '/services' });
    api.register(namespacesRoutes, { prefix: '/namespaces' });
  }, { prefix: '/api/v1' });

  return app;

};
