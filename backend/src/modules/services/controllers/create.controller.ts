import { FastifyRequest, FastifyReply } from "fastify";
import { CreateServiceService } from "../services/create.service";

export class CreateServiceController {
    private createServiceService: CreateServiceService;

    constructor() {
        this.createServiceService = new CreateServiceService();
    }

    createService = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const body = request.body as any;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const namespace = (request.query as any).namespace || 'default';

            const service = await this.createServiceService.createService(clusterId, userId, namespace, body);
            return reply.code(201).send({ success: true, data: service, message: "Service created successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
