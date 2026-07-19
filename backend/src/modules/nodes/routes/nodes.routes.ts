import { FastifyInstance } from 'fastify';
import { ListNodesController } from '../controllers/list.controller';
import { GetNodeController } from '../controllers/get.controller';
import { CordonNodeController } from '../controllers/cordon.controller';

export default async function nodesRoutes(fastify: FastifyInstance) {
    const listController = new ListNodesController();
    const getController = new GetNodeController();
    const cordonController = new CordonNodeController();

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
    }, listController.listNodes);

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
    }, getController.getNode);

    fastify.post('/:name/cordon', {
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
            },
            body: {
                type: 'object',
                required: ['unschedulable'],
                properties: {
                    unschedulable: { type: 'boolean' }
                },
                additionalProperties: false
            }
        }
    }, cordonController.cordonNode);
}
