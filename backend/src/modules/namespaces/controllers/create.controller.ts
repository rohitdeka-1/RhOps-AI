import { FastifyRequest, FastifyReply } from "fastify";
import { CreateNamespaceService } from "../services/create.service";

export class CreateNamespaceController {
    private createNamespaceService: CreateNamespaceService;

    constructor() {
        this.createNamespaceService = new CreateNamespaceService();
    }

    createNamespace = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const body = request.body as { name: string; labels?: { [key: string]: string } };

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            if (!body || !body.name) {
                return reply.code(400).send({ success: false, message: "Request body must contain 'name' property." });
            }

            const namespace = await this.createNamespaceService.createNamespace(clusterId, userId, body.name, body.labels);
            return reply.code(201).send({ success: true, data: namespace, message: "Namespace created successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
