import { FastifyRequest, FastifyReply } from "fastify";
import * as k8s from '@kubernetes/client-node';
import { CreateIngressService } from "../services/create.service";

export class CreateIngressController {
    private createIngressService: CreateIngressService;

    constructor() {
        this.createIngressService = new CreateIngressService();
    }

    createIngress = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const body = request.body as k8s.V1Ingress;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            if (!body) {
                return reply.code(400).send({ success: false, message: "Request body containing Ingress spec is required." });
            }

            const ingress = await this.createIngressService.createIngress(clusterId, userId, namespace, body);
            return reply.code(201).send({ success: true, data: ingress, message: "Ingress created successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
