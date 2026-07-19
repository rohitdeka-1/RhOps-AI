import { FastifyRequest, FastifyReply } from "fastify";
import { DeleteSecretService } from "../services/delete.service";

export class DeleteSecretController {
    private deleteSecretService: DeleteSecretService;

    constructor() {
        this.deleteSecretService = new DeleteSecretService();
    }

    deleteSecret = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            await this.deleteSecretService.deleteSecret(clusterId, userId, name, namespace);
            return reply.code(200).send({ success: true, message: "Secret deleted successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
