import { FastifyRequest, FastifyReply } from "fastify";
import { GetProjectService } from "../services/get.service";

export class GetProjectController {
    private getProjectService: GetProjectService;

    constructor() {
        this.getProjectService = new GetProjectService();
    }

    getProject = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const id = (request.params as any).id;

            const project = await this.getProjectService.get(id, userId);

            return reply.code(200).send({
                success: true,
                data: project,
                message: "Project retrieved successfully"
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Failed to retrieve project",
                error: error.message
            });
        }
    }
}
