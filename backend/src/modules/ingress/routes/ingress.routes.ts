import { FastifyInstance } from 'fastify';
import { ListIngressController } from '../controllers/list.controller';
import { GetIngressController } from '../controllers/get.controller';
import { CreateIngressController } from '../controllers/create.controller';
import { DeleteIngressController } from '../controllers/delete.controller';

export default async function ingressRoutes(fastify: FastifyInstance) {
    const listController = new ListIngressController();
    const getController = new GetIngressController();
    const createController = new CreateIngressController();
    const deleteController = new DeleteIngressController();

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
    }, listController.listIngresses);

    fastify.get('/:name', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                required: ['clusterId'],
                properties: {
                    clusterId: { type: 'string' },
                    namespace: { type: 'string' }
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
    }, getController.getIngress);

    fastify.post('/', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                required: ['clusterId'],
                properties: {
                    clusterId: { type: 'string' },
                    namespace: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                // Using additionalProperties true here since V1Ingress has a complex structure, 
                // ideally we would define the exact swagger spec for V1Ingress, 
                // but for now we accept the object to pass to the kubernetes client.
                additionalProperties: true
            }
        }
    }, createController.createIngress);

    fastify.delete('/:name', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                required: ['clusterId'],
                properties: {
                    clusterId: { type: 'string' },
                    namespace: { type: 'string' }
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
    }, deleteController.deleteIngress);
}
