import { FastifyInstance } from "fastify";
import { CreateProjectController } from "../controllers/create.controller";

export default async function projectRoutes(fastify: FastifyInstance) {
    const createProject = new CreateProjectController();

    fastify.post('/create', {
        preValidation: [fastify.authenticate],
        schema: {
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' }
                },
                required: ['name'],
                additionalProperties: false
            }
        }
    }, createProject.createProject)

}
