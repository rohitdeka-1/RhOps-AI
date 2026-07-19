import { FastifyRequest, FastifyReply } from "fastify";
import * as k8s from '@kubernetes/client-node';
import { CreateConfigMapService } from "../services/create.service";

export class CreateConfigMapController {
    private createConfigMapService: CreateConfigMapService;

    constructor() {
        this.createConfigMapService = new CreateConfigMapService();
    }

    createConfigMap = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const body = request.body as k8s.V1ConfigMap;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }
            if (!body) {
                return reply.code(400).send({ success: false, message: "Request body containing ConfigMap spec is required." });
            }

            const configmap = await this.createConfigMapService.createConfigMap(clusterId, userId, namespace, body);
            return reply.code(201).send({ success: true, data: configmap, message: "ConfigMap created successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
