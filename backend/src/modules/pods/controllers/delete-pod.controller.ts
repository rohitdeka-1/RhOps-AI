import { FastifyRequest, FastifyReply } from "fastify";
import { DeletePodService } from "../services/delete-pod.service";

export class DeletePodController {
    private deletePodService: DeletePodService;

    constructor() {
        this.deletePodService = new DeletePodService();
    }

    deletePod = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            await this.deletePodService.deletePod(clusterId, userId, name, namespace);

            return reply.code(200).send({ success: true, message: "Pod deleted successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
