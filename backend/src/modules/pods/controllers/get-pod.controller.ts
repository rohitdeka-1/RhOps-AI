import { FastifyRequest, FastifyReply } from "fastify";
import { GetPodService } from "../services/get-pod.service";

export class GetPodController {
    private getPodService: GetPodService;

    constructor() {
        this.getPodService = new GetPodService();
    }

    getPod = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const pod = await this.getPodService.getPod(clusterId, userId, name, namespace);

            return reply.code(200).send({ success: true, data: pod, message: "Pod retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
