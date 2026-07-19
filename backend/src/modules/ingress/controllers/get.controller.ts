import { FastifyRequest, FastifyReply } from "fastify";
import { GetIngressService } from "../services/get.service";

export class GetIngressController {
    private getIngressService: GetIngressService;

    constructor() {
        this.getIngressService = new GetIngressService();
    }

    getIngress = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const ingress = await this.getIngressService.getIngress(clusterId, userId, name, namespace);
            return reply.code(200).send({ success: true, data: ingress, message: "Ingress retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
