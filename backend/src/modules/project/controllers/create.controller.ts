import { FastifyRequest, FastifyReply } from "fastify";
import { CreateProjectService } from "../services/create.service";

export class CreateProjectController {
    private createProjectService: CreateProjectService;

    constructor() {
        this.createProjectService = new CreateProjectService();
    }

    createProject = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;

            const { name } = request.body as { name: string };

            const project = await this.createProjectService.create({ name, userId });

            return reply.code(201).send({
                success: true,
                data: project,
                message: "Project created successfully"
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Failed to create project",
                error: error.message
            });
        }
    }
}