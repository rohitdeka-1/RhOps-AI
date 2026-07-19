import { FastifyInstance } from 'fastify';
import { ListConfigMapsController } from '../controllers/list.controller';
import { GetConfigMapController } from '../controllers/get.controller';
import { CreateConfigMapController } from '../controllers/create.controller';
import { UpdateConfigMapController } from '../controllers/update.controller';
import { DeleteConfigMapController } from '../controllers/delete.controller';

export default async function configmapsRoutes(fastify: FastifyInstance) {
    const listController = new ListConfigMapsController();
    const getController = new GetConfigMapController();
    const createController = new CreateConfigMapController();
    const updateController = new UpdateConfigMapController();
    const deleteController = new DeleteConfigMapController();

    const querystringSchema = {
        type: 'object',
        required: ['clusterId'],
        properties: {
            clusterId: { type: 'string' },
            namespace: { type: 'string' }
        }
    };

    const paramsSchema = {
        type: 'object',
        required: ['name'],
        properties: {
            name: { type: 'string' }
        }
    };

    fastify.get('/', {
        preValidation: [fastify.authenticate],
        schema: { querystring: querystringSchema }
    }, listController.listConfigMaps);

    fastify.get('/:name', {
        preValidation: [fastify.authenticate],
        schema: { querystring: querystringSchema, params: paramsSchema }
    }, getController.getConfigMap);

    fastify.post('/', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: querystringSchema,
            body: {
                type: 'object',
                additionalProperties: true
            }
        }
    }, createController.createConfigMap);

    fastify.put('/:name', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: querystringSchema,
            params: paramsSchema,
            body: {
                type: 'object',
                additionalProperties: true
            }
        }
    }, updateController.updateConfigMap);

    fastify.delete('/:name', {
        preValidation: [fastify.authenticate],
        schema: { querystring: querystringSchema, params: paramsSchema }
    }, deleteController.deleteConfigMap);
}
