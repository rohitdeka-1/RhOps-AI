import { FastifyRequest, FastifyReply } from "fastify";
import { DeleteProjectService } from "../services/delete.service";

export class DeleteProjectController {

    private deleteProjectService: DeleteProjectService;

    constructor() {
        this.deleteProjectService = new DeleteProjectService();
    }

    deleteProject = async (request: FastifyRequest, reply: FastifyReply) => {
        try {

            const userId = (request.user as any).id;
            const { id } = request.params as { id: string };

            await this.deleteProjectService.deleteProject(id, userId);

            return reply.code(200).send({
                success: true,
                message: "Project deleted successfully"
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Failed to delete project",
                error: error.message
            });
        }
    }
}