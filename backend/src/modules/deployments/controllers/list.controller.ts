import { FastifyRequest, FastifyReply } from "fastify";
import { ListDeploymentsService } from "../services/list.service";

export class ListDeploymentsController {
    private listDeploymentsService: ListDeploymentsService;

    constructor() {
        this.listDeploymentsService = new ListDeploymentsService();
    }

    listDeployments = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const deployments = await this.listDeploymentsService.listDeployments(clusterId, userId, namespace);
            return reply.code(200).send({ success: true, data: deployments, message: "Deployments listed successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
