import { FastifyInstance } from 'fastify';
import { ListDeploymentsController } from '../controllers/list.controller';
import { GetDeploymentController } from '../controllers/get.controller';
import { ScaleDeploymentController } from '../controllers/scale.controller';
import { RestartDeploymentController } from '../controllers/restart.controller';
import { DeleteDeploymentController } from '../controllers/delete.controller';
import { CreateDeploymentController } from '../controllers/create.controller';
import { UpdateDeploymentController } from '../controllers/update.controller';

export default async function deploymentsRoutes(fastify: FastifyInstance) {
    const listController = new ListDeploymentsController();
    const getController = new GetDeploymentController();
    const scaleController = new ScaleDeploymentController();
    const restartController = new RestartDeploymentController();
    const deleteController = new DeleteDeploymentController();
    const createController = new CreateDeploymentController();
    const updateController = new UpdateDeploymentController();

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
    }, listController.listDeployments);

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
    }, getController.getDeployment);

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
    }, deleteController.deleteDeployment);

    fastify.post('/:name/scale', {
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
                required: ['replicas'],
                properties: {
                    replicas: { type: 'number' }
                },
                additionalProperties: false
            }
        }
    }, scaleController.scaleDeployment);

    fastify.post('/:name/restart', {
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
    }, restartController.restartDeployment);

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
                additionalProperties: true
            }
        }
    }, createController.createDeployment);

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
    }, updateController.updateDeployment);
}
