import { FastifyRequest, FastifyReply } from "fastify";
import { ScaleDeploymentService } from "../services/scale.service";

export class ScaleDeploymentController {
    private scaleDeploymentService: ScaleDeploymentService;

    constructor() {
        this.scaleDeploymentService = new ScaleDeploymentService();
    }

    scaleDeployment = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;
            const { replicas } = request.body as { replicas: number };

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }
            if (replicas === undefined || typeof replicas !== 'number') {
                return reply.code(400).send({ success: false, message: "Body must contain 'replicas' as a number." });
            }

            const result = await this.scaleDeploymentService.scaleDeployment(clusterId, userId, name, replicas, namespace);
            return reply.code(200).send({ success: true, data: result, message: "Deployment scaled successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
