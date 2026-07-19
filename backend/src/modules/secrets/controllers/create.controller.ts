import { FastifyRequest, FastifyReply } from "fastify";
import * as k8s from '@kubernetes/client-node';
import { CreateSecretService } from "../services/create.service";

export class CreateSecretController {
    private createSecretService: CreateSecretService;

    constructor() {
        this.createSecretService = new CreateSecretService();
    }

    createSecret = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const body = request.body as k8s.V1Secret;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }
            if (!body) {
                return reply.code(400).send({ success: false, message: "Request body containing Secret spec is required." });
            }

            const secret = await this.createSecretService.createSecret(clusterId, userId, namespace, body);
            return reply.code(201).send({ success: true, data: secret, message: "Secret created successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
