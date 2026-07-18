import { FastifyRequest, FastifyReply } from "fastify";
import { GetServiceService } from "../services/get.service";

export class GetServiceController {
    private getServiceService: GetServiceService;

    constructor() {
        this.getServiceService = new GetServiceService();
    }

    getService = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const service = await this.getServiceService.getService(clusterId, userId, name, namespace);
            return reply.code(200).send({ success: true, data: service, message: "Service retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
