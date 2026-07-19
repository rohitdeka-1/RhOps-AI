import { FastifyRequest, FastifyReply } from "fastify";
import { ListIngressService } from "../services/list.service";

export class ListIngressController {
    private listIngressService: ListIngressService;

    constructor() {
        this.listIngressService = new ListIngressService();
    }

    listIngresses = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const ingresses = await this.listIngressService.listIngresses(clusterId, userId, namespace);
            return reply.code(200).send({ success: true, data: ingresses, message: "Ingress resources listed successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
