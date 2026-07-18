import { FastifyRequest, FastifyReply } from "fastify";
import { ListServicesService } from "../services/list.service";

export class ListServicesController {
    private listServicesService: ListServicesService;

    constructor() {
        this.listServicesService = new ListServicesService();
    }

    listServices = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request.user as any).id;
            const clusterId = (request.query as any).clusterId;
            const namespace = (request.query as any).namespace || 'default';

            if (!clusterId) {
                return reply.code(400).send({ success: false, message: "Query parameter 'clusterId' is required." });
            }

            const services = await this.listServicesService.listServices(clusterId, userId, namespace);
            return reply.code(200).send({ success: true, data: services, message: "Services listed successfully" });
        } catch (err: any) {
            return reply.code(500).send({ success: false, message: err.message });
        }
    }
}
