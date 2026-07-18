import { FastifyInstance } from 'fastify';
import { ConnectClusterController } from '../controllers/connect-cluster.controller';
import { DisconnectClusterController } from '../controllers/disconnect-cluster.controller';
import { ListClusterController } from '../controllers/list-clusters.controller';

export default async function clusterRoutes(fastify: FastifyInstance) {
    const connectClusterController = new ConnectClusterController();
    const disconnectClusterController = new DisconnectClusterController();
    const listClusterController = new ListClusterController();

    fastify.post('/connect', {
        preValidation: [fastify.authenticate],
        schema: {
            body: {
                type: 'object',
                required: ['name', 'provider', 'projectId', 'kubeconfig'],
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
                    projectId: { 
                        type: 'object', 
                        required: ['value'], 
                        properties: { value: { type: 'string' } } 
                    },
                    kubeconfig: { 
                        anyOf: [
                            { type: 'object' },
                            { type: 'array' }
                        ]
                    }
                },
                additionalProperties: false
            }
        }
    }, connectClusterController.connect);

    fastify.delete('/:id', {
        preValidation: [fastify.authenticate],
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                },
                additionalProperties: false
            }
        }
    }, disconnectClusterController.disconnect);

    fastify.get('/', {
        preValidation: [fastify.authenticate]
    }, listClusterController.listClusters);

    fastify.get('/:id/namespaces', {
        preValidation: [fastify.authenticate],
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string' }
                },
                additionalProperties: false
            }
        }
    }, listClusterController.listNamespaces);
}
