import { FastifyInstance } from 'fastify';
import { ListNamespacesController } from '../controllers/list.controller';
import { GetNamespaceController } from '../controllers/get.controller';
import { CreateNamespaceController } from '../controllers/create.controller';
import { DeleteNamespaceController } from '../controllers/delete.controller';

export default async function namespacesRoutes(fastify: FastifyInstance) {
    const listController = new ListNamespacesController();
    const getController = new GetNamespaceController();
    const createController = new CreateNamespaceController();
    const deleteController = new DeleteNamespaceController();

    fastify.get('/', {
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
    }, listController.listNamespaces);

    fastify.get('/:name', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                required: ['clusterId'],
                properties: {
                    clusterId: { type: 'string' }
                }
            },
            params: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string' }
                }
            }
        }
    }, getController.getNamespace);

    fastify.post('/', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                required: ['clusterId'],
                properties: {
                    clusterId: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string' },
                    labels: {
                        type: 'object',
                        additionalProperties: { type: 'string' }
                    }
                },
                additionalProperties: false
            }
        }
    }, createController.createNamespace);

    fastify.delete('/:name', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                required: ['clusterId'],
                properties: {
                    clusterId: { type: 'string' }
                }
            },
            params: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string' }
                }
            }
        }
    }, deleteController.deleteNamespace);
}
