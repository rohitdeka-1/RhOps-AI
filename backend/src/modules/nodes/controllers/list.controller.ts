import { FastifyRequest, FastifyReply } from "fastify";
import { ListNodesService } from "../services/list.service";

export class ListNodesController {
    private listNodesService: ListNodesService;

    constructor() {
        this.listNodesService = new ListNodesService();
    }

    listNodes = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const nodes = await this.listNodesService.listNodes(clusterId, userId);
            return reply.code(200).send({ success: true, data: nodes, message: "Nodes listed successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
