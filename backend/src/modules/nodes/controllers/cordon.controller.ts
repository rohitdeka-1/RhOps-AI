import { FastifyRequest, FastifyReply } from "fastify";
import { CordonNodeService } from "../services/cordon.service";

export class CordonNodeController {
    private cordonNodeService: CordonNodeService;

    constructor() {
        this.cordonNodeService = new CordonNodeService();
    }

    cordonNode = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const name = (request.params as any).name;
            const body = request.body as { unschedulable: boolean };

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            if (!body || typeof body.unschedulable !== 'boolean') {
                return reply.code(400).send({ success: false, message: "Request body must contain boolean 'unschedulable' property." });
            }

            const node = await this.cordonNodeService.cordonNode(clusterId, userId, name, body.unschedulable);
            return reply.code(200).send({ success: true, data: node, message: `Node ${body.unschedulable ? 'cordoned' : 'uncordoned'} successfully` });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
