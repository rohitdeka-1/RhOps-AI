import { FastifyInstance } from 'fastify';
import { ListEventsController } from '../controllers/list.controller';

export default async function eventsRoutes(fastify: FastifyInstance) {
    const listController = new ListEventsController();

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
    }, listController.listEvents);
}
