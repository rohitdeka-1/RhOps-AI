import { FastifyRequest, FastifyReply } from "fastify";
import { RestartDeploymentService } from "../services/restart.service";

export class RestartDeploymentController {
    private restartDeploymentService: RestartDeploymentService;

    constructor() {
        this.restartDeploymentService = new RestartDeploymentService();
    }

    restartDeployment = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const result = await this.restartDeploymentService.restartDeployment(clusterId, userId, name, namespace);
            return reply.code(200).send({ success: true, data: result, message: "Deployment restarted successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
