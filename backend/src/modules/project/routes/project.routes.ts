import { FastifyInstance } from "fastify";
import { CreateProjectController } from "../controllers/create.controller";
import { ListProjectController } from "../controllers/list.controller";
import { GetProjectController } from "../controllers/get.controller";
import { UpdateProjectController } from "../controllers/update.controller";
import { DeleteProjectController } from "../controllers/delete.controller";

export default async function projectRoutes(fastify: FastifyInstance) {
    const createProject = new CreateProjectController();
    const listProject = new ListProjectController();
    const getProject = new GetProjectController();
    const updateProject = new UpdateProjectController();
    const deleteProject = new DeleteProjectController();

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
    }, createProject.createProject);

    fastify.get('/', {
        preValidation: [fastify.authenticate]
    }, listProject.listProjects);

    fastify.get('/:id', {
        preValidation: [fastify.authenticate],
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            }
        }
    }, getProject.getProject);

    fastify.put('/:id', {
        preValidation: [fastify.authenticate],
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' }
                },
                required: ['name'],
                additionalProperties: false
            }
        }
    }, updateProject.updateProject);

    fastify.delete('/:id', {
        preValidation: [fastify.authenticate],
        schema: {
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            }
        }
    }, deleteProject.deleteProject);
}
