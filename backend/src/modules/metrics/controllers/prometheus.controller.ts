import { FastifyRequest, FastifyReply } from "fastify";
import { PrometheusCheckService } from "../services/prometheus-check.service";

export class PrometheusMetricsController {
    private checkService: PrometheusCheckService;

    constructor() {
        this.checkService = new PrometheusCheckService();
    }

    checkStatus = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const status = await this.checkService.checkPrometheusStatus(clusterId, userId);
            return reply.code(200).send({ success: true, data: status });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
