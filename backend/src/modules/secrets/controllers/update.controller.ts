import { FastifyRequest, FastifyReply } from "fastify";
import * as k8s from '@kubernetes/client-node';
import { UpdateSecretService } from "../services/update.service";

export class UpdateSecretController {
    private updateSecretService: UpdateSecretService;

    constructor() {
        this.updateSecretService = new UpdateSecretService();
    }

    updateSecret = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;
            const body = request.body as k8s.V1Secret;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }
            if (!body) {
                return reply.code(400).send({ success: false, message: "Request body containing Secret spec is required." });
            }

            const secret = await this.updateSecretService.updateSecret(clusterId, userId, name, namespace, body);
            return reply.code(200).send({ success: true, data: secret, message: "Secret updated successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
