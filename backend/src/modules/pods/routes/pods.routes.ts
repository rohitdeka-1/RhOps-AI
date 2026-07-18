import { FastifyInstance } from 'fastify';
import { GetPodsController } from '../controllers/get-pods.controller';
import { GetPodController } from '../controllers/get-pod.controller';
import { DeletePodController } from '../controllers/delete-pod.controller';
import { DescribeController } from '../controllers/describe.controller';
import { LogsController } from '../controllers/logs.controller';
import { RestartPodController } from '../controllers/restart-pod.controller';
import { ExecController } from '../controllers/exec.controller';

export default async function podsRoutes(fastify: FastifyInstance) {
    const getPodsController = new GetPodsController();
    const getPodController = new GetPodController();
    const deletePodController = new DeletePodController();
    const describeController = new DescribeController();
    const logsController = new LogsController();
    const restartPodController = new RestartPodController();
    const execController = new ExecController();

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
    }, getPodsController.listPods);

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
    }, getPodController.getPod);

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
    }, deletePodController.deletePod);

    fastify.get('/:name/describe', {
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
    }, describeController.describePod);

    fastify.get('/:name/logs', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                required: ['clusterId'],
                properties: {
                    clusterId: { type: 'string' },
                    namespace: { type: 'string' },
                    container: { type: 'string' }
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
    }, logsController.getLogs);

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
    }, restartPodController.restartPod);

    fastify.post('/:name/exec', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                required: ['clusterId'],
                properties: {
                    clusterId: { type: 'string' },
                    namespace: { type: 'string' },
                    container: { type: 'string' }
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
                required: ['command'],
                properties: {
                    command: {
                        type: 'array',
                        items: { type: 'string' }
                    }
                }
            }
        }
    }, execController.execPod);
}
