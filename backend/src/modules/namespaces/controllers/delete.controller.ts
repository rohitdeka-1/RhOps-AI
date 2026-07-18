import { FastifyRequest, FastifyReply } from "fastify";
import { DeleteNamespaceService } from "../services/delete.service";

export class DeleteNamespaceController {
    private deleteNamespaceService: DeleteNamespaceService;

    constructor() {
        this.deleteNamespaceService = new DeleteNamespaceService();
    }

    deleteNamespace = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            await this.deleteNamespaceService.deleteNamespace(clusterId, userId, name);
            return reply.code(200).send({ success: true, message: "Namespace deleted successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
