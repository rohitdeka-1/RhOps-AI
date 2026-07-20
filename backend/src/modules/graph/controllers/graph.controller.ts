import { FastifyRequest, FastifyReply } from "fastify";
import { CpuGraphService } from "../services/cpu.service";
import { MemoryGraphService } from "../services/memory.service";

export class GraphController {
    private cpuGraphService: CpuGraphService;
    private memoryGraphService: MemoryGraphService;

    constructor() {
        this.cpuGraphService = new CpuGraphService();
        this.memoryGraphService = new MemoryGraphService();
    }

    getCpuGraph = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const { clusterId, namespace, start, end, step } = request.query as any;

            if (!clusterId || !namespace || !start || !end || !step) {
                return reply.code(400).send({ 
                    success: false, 
                    message: "Query parameters 'clusterId', 'namespace', 'start', 'end', and 'step' are required." 
                });
            }

            const data = await this.cpuGraphService.getCpuMetrics(clusterId, userId, namespace, start, end, step);
            return reply.code(200).send({ success: true, data, message: "CPU metrics fetched successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }

    getMemoryGraph = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const { clusterId, namespace, start, end, step } = request.query as any;

            if (!clusterId || !namespace || !start || !end || !step) {
                return reply.code(400).send({ 
                    success: false, 
                    message: "Query parameters 'clusterId', 'namespace', 'start', 'end', and 'step' are required." 
                });
            }

            const data = await this.memoryGraphService.getMemoryMetrics(clusterId, userId, namespace, start, end, step);
            return reply.code(200).send({ success: true, data, message: "Memory metrics fetched successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
