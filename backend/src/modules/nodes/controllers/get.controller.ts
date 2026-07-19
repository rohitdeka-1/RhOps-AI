import { FastifyRequest, FastifyReply } from "fastify";
import { GetNodeService } from "../services/get.service";

export class GetNodeController {
    private getNodeService: GetNodeService;

    constructor() {
        this.getNodeService = new GetNodeService();
    }

    getNode = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const node = await this.getNodeService.getNode(clusterId, userId, name);
            return reply.code(200).send({ success: true, data: node, message: "Node retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
