import { FastifyRequest, FastifyReply } from "fastify";
import { GetDeploymentService } from "../services/get.service";

export class GetDeploymentController {
    private getDeploymentService: GetDeploymentService;

    constructor() {
        this.getDeploymentService = new GetDeploymentService();
    }

    getDeployment = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const deployment = await this.getDeploymentService.getDeployment(clusterId, userId, name, namespace);
            return reply.code(200).send({ success: true, data: deployment, message: "Deployment retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
