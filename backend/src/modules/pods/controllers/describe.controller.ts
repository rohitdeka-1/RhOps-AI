import { FastifyRequest, FastifyReply } from "fastify";
import { DescribeService } from "../services/describe.service";

export class DescribeController {
    private describeService: DescribeService;

    constructor() {
        this.describeService = new DescribeService();
    }

    describePod = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const podDescription = await this.describeService.describePod(clusterId, userId, name, namespace);

            return reply.code(200).send({ success: true, data: podDescription, message: "Pod described successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
