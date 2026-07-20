import { FastifyInstance } from 'fastify';
import { GraphController } from '../controllers/graph.controller';

export default async function graphRoutes(fastify: FastifyInstance) {
    const graphController = new GraphController();

    const graphQuerySchema = {
        type: 'object',
        required: ['clusterId', 'namespace', 'start', 'end', 'step'],
        properties: {
            clusterId: { type: 'string' },
            namespace: { type: 'string' },
            start: { type: ['string', 'number'] },
            end: { type: ['string', 'number'] },
            step: { type: 'string' }
        }
    };

    fastify.get('/cpu', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: graphQuerySchema
        }
    }, graphController.getCpuGraph);

    fastify.get('/memory', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: graphQuerySchema
        }
    }, graphController.getMemoryGraph);
}
