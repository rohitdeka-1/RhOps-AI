import { FastifyInstance } from 'fastify';
import { ConnectClusterController } from '../controllers/connect-cluster.controller';

export default async function clusterRoutes(fastify: FastifyInstance) {
    const connectClusterController = new ConnectClusterController();

    fastify.post('/connect', {
        preValidation: [fastify.authenticate],
        schema: {
            body: {
                type: 'object',
                required: ['name', 'provider', 'kubeconfig'],
                properties: {
                    name: { 
                        type: 'object', 
                        required: ['value'], 
                        properties: { value: { type: 'string' } } 
                    },
                    provider: { 
                        type: 'object', 
                        required: ['value'], 
                        properties: { value: { type: 'string' } } 
                    },
                    kubeconfig: { 
                        type: ['object', 'array']
                    }
                }
            }
        }
    }, connectClusterController.connect);
}
