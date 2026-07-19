import { FastifyRequest, FastifyReply } from "fastify";
import { PodsMetricsService } from "../services/pods-metrics.service";

export class PodsMetricsController {
    private podsMetricsService: PodsMetricsService;

    constructor() {
        this.podsMetricsService = new PodsMetricsService();
    }

    getPodsMetrics = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const metrics = await this.podsMetricsService.getPodsMetrics(clusterId, userId, namespace);
            return reply.code(200).send({ success: true, data: metrics, message: "Pod metrics retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
