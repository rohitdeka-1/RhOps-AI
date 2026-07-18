import { FastifyRequest, FastifyReply } from "fastify";
import { GetNamespaceService } from "../services/get.service";

export class GetNamespaceController {
    private getNamespaceService: GetNamespaceService;

    constructor() {
        this.getNamespaceService = new GetNamespaceService();
    }

    getNamespace = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const namespace = await this.getNamespaceService.getNamespace(clusterId, userId, name);
            return reply.code(200).send({ success: true, data: namespace, message: "Namespace retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
