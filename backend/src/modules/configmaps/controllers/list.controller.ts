import { FastifyRequest, FastifyReply } from "fastify";
import { ListConfigMapsService } from "../services/list.service";

export class ListConfigMapsController {
    private listConfigMapsService: ListConfigMapsService;

    constructor() {
        this.listConfigMapsService = new ListConfigMapsService();
    }

    listConfigMaps = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const configmaps = await this.listConfigMapsService.listConfigMaps(clusterId, userId, namespace);
            return reply.code(200).send({ success: true, data: configmaps, message: "ConfigMaps retrieved successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
