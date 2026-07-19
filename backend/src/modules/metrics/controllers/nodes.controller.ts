import { FastifyRequest, FastifyReply } from "fastify";
import { NodesMetricsService } from "../services/nodes-metrics.service";

export class NodesMetricsController {
    private nodesMetricsService: NodesMetricsService;

    constructor() {
        this.nodesMetricsService = new NodesMetricsService();
    }

    getNodesMetrics = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const metrics = await this.nodesMetricsService.getNodesMetrics(clusterId, userId);
            return reply.code(200).send({ success: true, data: metrics, message: "Node metrics retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
