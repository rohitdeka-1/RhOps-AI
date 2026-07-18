import { FastifyRequest, FastifyReply } from "fastify";
import { ExecService } from "../services/exec.service";

export class ExecController {
    private execService: ExecService;

    constructor() {
        this.execService = new ExecService();
    }

    execPod = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const container = (request.query as any).container;
            const name = (request.params as any).name;
            const { command } = request.body as { command: string[] };

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }
            if (!command || !Array.isArray(command)) {
                return reply.code(400).send({ success: false, message: "Body must contain a 'command' array." });
            }

            const output = await this.execService.execCommand(clusterId, userId, name, namespace, command, container);

            return reply.code(200).send({ success: true, data: output, message: "Command executed successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
