import { FastifyRequest, FastifyReply } from "fastify";
import { UpdateProjectService } from "../services/update.service";

export class UpdateProjectController {
    private updateProjectService: UpdateProjectService;

    constructor() {
        this.updateProjectService = new UpdateProjectService();
    }

    updateProject = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const id = (request.params as any).id;
            const { name } = request.body as { name: string };

            const project = await this.updateProjectService.update(id, userId, { name });

            return reply.code(200).send({
                success: true,
                data: project,
                message: "Project updated successfully"
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Failed to update project",
                error: error.message
            });
        }
    }
}
