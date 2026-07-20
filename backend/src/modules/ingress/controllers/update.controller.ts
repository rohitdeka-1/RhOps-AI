import { FastifyRequest, FastifyReply } from "fastify";
import { UpdateIngressService } from "../services/update.service";

export class UpdateIngressController {
    private updateIngressService: UpdateIngressService;

    constructor() {
        this.updateIngressService = new UpdateIngressService();
    }

    updateIngress = async (request: FastifyRequest, reply: FastifyReply) => {
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
                return reply.code(400).send({ success: false, message: "Ingress name is required in params." });
            }

            const ingress = await this.updateIngressService.updateIngress(clusterId, userId, name, namespace, body);
            return reply.code(200).send({ success: true, data: ingress, message: "Ingress updated successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
