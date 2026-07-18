import { FastifyRequest, FastifyReply } from "fastify";
import { PodsService } from "../services/pods.service";

export class PodsController {
    private podsService: PodsService;

    constructor() {
        this.podsService = new PodsService();
    }

    listPods = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';

            if (!clusterId) {
                return reply.code(400).send({
                    success: false,
                    message: "Query parameter 'clusterId' is required."
                });
            }

            const pods = await this.podsService.listPods(clusterId, userId, namespace);

            return reply.code(200).send({
                success: true,
                data: pods,
                message: "Pods listed successfully"
            });

        } catch (err: any) {
            return reply.code(500).send({
                success: false,
                message: err.message
            });
        }
    }

    getPod = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const pod = await this.podsService.getPod(clusterId, userId, name, namespace);

            return reply.code(200).send({ success: true, data: pod, message: "Pod retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }

    deletePod = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            await this.podsService.deletePod(clusterId, userId, name, namespace);

            return reply.code(200).send({ success: true, message: "Pod deleted successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }

    describePod = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const podDescription = await this.podsService.describePod(clusterId, userId, name, namespace);

            return reply.code(200).send({ success: true, data: podDescription, message: "Pod described successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
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

            const logs = await this.podsService.getLogs(clusterId, userId, name, namespace, container);

            return reply.code(200).send({ success: true, data: logs, message: "Logs retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }

    restartPod = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';
            const name = (request.params as any).name;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            await this.podsService.restartPod(clusterId, userId, name, namespace);

            return reply.code(200).send({ success: true, message: "Pod restarted successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
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

            const output = await this.podsService.execCommand(clusterId, userId, name, namespace, command, container);

            return reply.code(200).send({ success: true, data: output, message: "Command executed successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
