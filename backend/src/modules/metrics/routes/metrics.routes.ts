import { FastifyInstance } from 'fastify';
import { NodesMetricsController } from '../controllers/nodes.controller';
import { PodsMetricsController } from '../controllers/pods.controller';

export default async function metricsRoutes(fastify: FastifyInstance) {
    const nodesMetricsController = new NodesMetricsController();
    const podsMetricsController = new PodsMetricsController();

    fastify.get('/nodes', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                required: ['clusterId'],
                properties: {
                    clusterId: { type: 'string' }
                }
            }
        }
    }, nodesMetricsController.getNodesMetrics);

    fastify.get('/pods', {
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
    }, podsMetricsController.getPodsMetrics);
}
