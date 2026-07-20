import { FastifyRequest, FastifyReply } from "fastify";
import { CreateDeploymentService } from "../services/create.service";

export class CreateDeploymentController {
    private createDeploymentService: CreateDeploymentService;

    constructor() {
        this.createDeploymentService = new CreateDeploymentService();
    }

    createDeployment = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const body = request.body as any;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const namespace = (request.query as any).namespace || 'default';

            const deployment = await this.createDeploymentService.createDeployment(clusterId, userId, namespace, body);
            return reply.code(201).send({ success: true, data: deployment, message: "Deployment created successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
