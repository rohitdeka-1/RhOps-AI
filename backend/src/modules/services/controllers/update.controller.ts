import { FastifyRequest, FastifyReply } from "fastify";
import { UpdateServiceService } from "../services/update.service";

export class UpdateServiceController {
    private updateServiceService: UpdateServiceService;

    constructor() {
        this.updateServiceService = new UpdateServiceService();
    }

    updateService = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const { name } = request.params as any;
            const body = request.body as any;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            if (!name) {
                return reply.code(400).send({ success: false, message: "Service name is required in params." });
            }

            const service = await this.updateServiceService.updateService(clusterId, userId, name, namespace, body);
            return reply.code(200).send({ success: true, data: service, message: "Service updated successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
