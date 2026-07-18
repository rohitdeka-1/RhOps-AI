import { FastifyInstance } from 'fastify';
import { PodsController } from '../controllers/pods.controller';

export default async function podsRoutes(fastify: FastifyInstance) {
    const podsController = new PodsController();

    fastify.get('/', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                required: ['clusterId'],
                properties: {
                    clusterId: { type: 'string' },
                    namespace: { type: 'string' }
                }
            }
        }
    }, podsController.listPods);
}
