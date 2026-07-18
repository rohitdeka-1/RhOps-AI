import { FastifyRequest, FastifyReply } from "fastify";
import { LogsService } from "../services/logs.service";

export class LogsController {
    private logsService: LogsService;

    constructor() {
        this.logsService = new LogsService();
    }

    getLogs = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const container = (request.query as any).container;
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const logs = await this.logsService.getLogs(clusterId, userId, name, namespace, container);

            return reply.code(200).send({ success: true, data: logs, message: "Logs retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
