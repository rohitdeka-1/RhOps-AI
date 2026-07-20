import { FastifyRequest, FastifyReply } from "fastify";
import { UpdateDeploymentService } from "../services/update.service";

export class UpdateDeploymentController {
    private updateDeploymentService: UpdateDeploymentService;

    constructor() {
        this.updateDeploymentService = new UpdateDeploymentService();
    }

    updateDeployment = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const { name } = request.params as any;
            const body = request.body as any;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            if (!name) {
                return reply.code(400).send({ success: false, message: "Deployment name is required in params." });
            }

            const deployment = await this.updateDeploymentService.updateDeployment(clusterId, userId, name, namespace, body);
            return reply.code(200).send({ success: true, data: deployment, message: "Deployment updated successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
