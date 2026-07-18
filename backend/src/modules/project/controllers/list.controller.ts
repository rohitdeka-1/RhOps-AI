import { FastifyRequest, FastifyReply } from "fastify";
import { ListProjectService } from "../services/list.service";

export class ListProjectController {
    private listProjectService: ListProjectService;

    constructor() {
        this.listProjectService = new ListProjectService();
    }

    listProjects = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const projects = await this.listProjectService.list(userId);

            return reply.code(200).send({
                success: true,
                data: projects,
                message: "Projects listed successfully"
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Failed to list projects",
                error: error.message
            });
        }
    }
}
