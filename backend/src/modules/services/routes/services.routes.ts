import { FastifyInstance } from 'fastify';
import { ListServicesController } from '../controllers/list.controller';
import { GetServiceController } from '../controllers/get.controller';
import { DeleteServiceController } from '../controllers/delete.controller';
import { CreateServiceController } from '../controllers/create.controller';
import { UpdateServiceController } from '../controllers/update.controller';

export default async function servicesRoutes(fastify: FastifyInstance) {
    const listController = new ListServicesController();
    const getController = new GetServiceController();
    const deleteController = new DeleteServiceController();
    const createController = new CreateServiceController();
    const updateController = new UpdateServiceController();

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
    }, listController.listServices);

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
    }, getController.getService);

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
    }, deleteController.deleteService);

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
                additionalProperties: true
            }
        }
    }, createController.createService);

    fastify.put('/:name', {
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
            },
            body: {
                type: 'object',
                additionalProperties: true
            }
        }
    }, updateController.updateService);
}
