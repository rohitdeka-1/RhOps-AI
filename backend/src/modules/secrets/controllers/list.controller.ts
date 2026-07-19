import { FastifyRequest, FastifyReply } from "fastify";
import { ListSecretsService } from "../services/list.service";

export class ListSecretsController {
    private listSecretsService: ListSecretsService;

    constructor() {
        this.listSecretsService = new ListSecretsService();
    }

    listSecrets = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const secrets = await this.listSecretsService.listSecrets(clusterId, userId, namespace);
            return reply.code(200).send({ success: true, data: secrets, message: "Secrets retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
