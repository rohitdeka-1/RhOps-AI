import { FastifyRequest, FastifyReply } from "fastify";
import { PodsService } from "../services/pods.service";

export class PodsController {
    private podsService: PodsService;

    constructor() {
        this.podsService = new PodsService();
    }

    listPods = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';

            if (!clusterId) {
                return reply.code(400).send({
                    success: false,
                    message: "Query parameter 'clusterId' is required."
                });
            }

            const pods = await this.podsService.listPods(clusterId, userId, namespace);

            return reply.code(200).send({
                success: true,
                data: pods,
                message: "Pods listed successfully"
            });

        } catch (err: any) {
            return reply.code(500).send({
                success: false,
                message: err.message
            });
        }
    }
}
