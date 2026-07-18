import { FastifyRequest, FastifyReply } from "fastify";
import { ListNamespacesService } from "../services/list.service";

export class ListNamespacesController {
    private listNamespacesService: ListNamespacesService;

    constructor() {
        this.listNamespacesService = new ListNamespacesService();
    }

    listNamespaces = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const namespaces = await this.listNamespacesService.listNamespaces(clusterId, userId);
            return reply.code(200).send({ success: true, data: namespaces, message: "Namespaces listed successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
