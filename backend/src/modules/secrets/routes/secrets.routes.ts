import { FastifyInstance } from 'fastify';
import { ListSecretsController } from '../controllers/list.controller';
import { GetSecretController } from '../controllers/get.controller';
import { CreateSecretController } from '../controllers/create.controller';
import { UpdateSecretController } from '../controllers/update.controller';
import { DeleteSecretController } from '../controllers/delete.controller';

export default async function secretsRoutes(fastify: FastifyInstance) {
    const listController = new ListSecretsController();
    const getController = new GetSecretController();
    const createController = new CreateSecretController();
    const updateController = new UpdateSecretController();
    const deleteController = new DeleteSecretController();

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
    }, listController.listSecrets);

    fastify.get('/:name', {
        preValidation: [fastify.authenticate],
        schema: { querystring: querystringSchema, params: paramsSchema }
    }, getController.getSecret);

    fastify.post('/', {
        preValidation: [fastify.authenticate],
        schema: {
            querystring: querystringSchema,
            body: {
                type: 'object',
                additionalProperties: true
            }
        }
    }, createController.createSecret);

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
    }, updateController.updateSecret);

    fastify.delete('/:name', {
        preValidation: [fastify.authenticate],
        schema: { querystring: querystringSchema, params: paramsSchema }
    }, deleteController.deleteSecret);
}
